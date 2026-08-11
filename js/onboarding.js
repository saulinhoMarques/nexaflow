document.addEventListener('DOMContentLoaded', () => {
  const steps = Array.from(document.querySelectorAll('.onboarding-step'));
  const progressFill = document.querySelector('.progress-fill');
  const progressText = document.querySelector('.progress-text');
  const prevBtn = document.querySelector('.btn-prev');
  const nextBtn = document.querySelector('.btn-next');
  const stepPills = Array.from(document.querySelectorAll('.step-pill'));
  let currentStep = 0;

  const updateStepState = () => {
    steps.forEach((step, index) => step.classList.toggle('active', index === currentStep));
    stepPills.forEach((pill, index) => pill.classList.toggle('active', index === currentStep));
    const percent = ((currentStep + 1) / steps.length) * 100;
    progressFill.style.width = `${percent}%`;
    progressText.textContent = `Etapa ${currentStep + 1} de ${steps.length}`;
    prevBtn.disabled = currentStep === 0;
    if (currentStep === steps.length - 1) {
      nextBtn.textContent = 'Ir para o Dashboard';
      nextBtn.classList.add('btn-primary-custom');
      nextBtn.classList.remove('btn-outline-custom');
    } else {
      nextBtn.textContent = 'Continuar';
      nextBtn.classList.remove('btn-outline-custom');
      nextBtn.classList.add('btn-primary-custom');
    }
  };

  prevBtn.addEventListener('click', () => {
    if (currentStep === 0) return;
    currentStep -= 1;
    updateStepState();
  });

  nextBtn.addEventListener('click', () => {
    if (currentStep === steps.length - 1) {
      window.location.href = 'dashboard.html';
      return;
    }
    currentStep += 1;
    updateStepState();
  });

  updateStepState();
});
