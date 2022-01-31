const { watch, computed } = require( 'vue');
const useMso = require( './use/useMso.js');

const {
  mso,
  state,
  setUpmix,
  upmixLabels,
  setLipsyncDelay,
  currentDiracSlot,
  setDiracSlot,
  resetBEQ,
  removeBEQActive,
} = useMso();

const minimist = require( 'minimist');
const argv = minimist(process.argv.slice(2));

if (!argv["ip-address"]) {
  console.log("usage: --ip-address {IP address of HTP-1}")
  process.exit(1);
}

// const eventLog = ref([]);

function applyDefaultsForCurrentInput(reason) {
  // apply default upmix if one is defined
  if (
    currentInput?.value?.defaultUpmix &&
    currentInput?.value?.defaultUpmix !== mso.value.upmix.select
  ) {
    console.log({
      event: `Apply Default Upmix for ${currentInput?.value?.label}`,
      reason: reason,
      old: upmixLabels[mso.value.upmix.select],
      new: upmixLabels[currentInput?.value?.defaultUpmix],
      time: new Date(),
    });

    setUpmix(currentInput?.value?.defaultUpmix);
  }

  // apply input delay if different from current delay
  if (
    typeof currentInput?.value?.delay === 'number' &&
    currentInput?.value?.delay !== mso?.value?.cal?.lipsync
  ) {
    console.log({
      event: `Apply Delay for ${currentInput?.value?.label}`,
      reason: reason,
      old: `${mso?.value?.cal?.lipsync} ms`,
      new: `${currentInput?.value?.delay} ms`,
      time: new Date(),
    });

    setLipsyncDelay(currentInput?.value?.delay);
  }

  // apply dirac slot if needed
  if (
    typeof currentInput?.value?.diracslot === 'number' &&
    currentInput?.value?.diracslot !== mso.value.cal?.currentdiracslot
  ) {
    console.log({
      event: `Apply Dirac Slot for ${currentInput?.value?.label}`,
      reason: reason,
      old: currentDiracSlot.value.name,
      new: mso.value.cal.slots[currentInput?.value?.diracslot].name,
      time: new Date(),
    });

    setDiracSlot(currentInput?.value?.diracslot);
  }

  // reset BEQ filters if needed
  for (const ch of ['sub1', 'sub2', 'sub3', 'sub4', 'sub5']) {
    for (let slot = 0; slot < 16; slot++) {
      if (mso.value.peq.slots[slot].channels[ch].beq) {
        resetBEQ(ch, slot);
      }
    }
  }

  if (mso.value.peq.beqActive) {
    console.log({
      event: `Clear BEQ Filters`,
      reason: reason,
      old: mso.value.peq.beqActive,
      new: '',
      time: new Date(),
    });
    removeBEQActive();
  }
}

const powerIsOn = computed(() => {
  return mso?.value?.powerIsOn;
});

const currentInput = computed(() => {
  if (mso?.value?.inputs) {
    return mso?.value?.inputs[mso?.value?.input];
  }

  return null;
});

watch(
  () => powerIsOn.value,
  (newPower, oldPower) => {
    applyDefaultsForCurrentInput('Power State Changed');
  }
);

watch(
  () => currentInput.value,
  (newInput, oldInput) => {
    if (mso && newInput?.label && oldInput?.label) {
      applyDefaultsForCurrentInput('Input Changed');
    }
  }
);