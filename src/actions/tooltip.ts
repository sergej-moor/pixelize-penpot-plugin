interface TooltipParams {
  text: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  maxWidth?: string;
  textClass?: string;
  paddingClass?: string;
  background?: string;
}

export const tooltip = (
  node: HTMLElement,
  param: TooltipParams
): { update: (params: TooltipParams) => void; destroy: () => void } => {
  let alreadyLeft: boolean;
  const {
    text,
    position = 'top',
    maxWidth = 'max-w-xs',
    textClass,
    // Remove unused parameters
    // paddingClass,
    // background,
  } = param;
  let timer: number;
  let updatedText: string;

  function handleDebounceEnter(event: Event): void {
    if (!(event.target instanceof HTMLElement)) return;
    event.stopPropagation();
    alreadyLeft = false;
    const existingTooltip = event.target.querySelector('.js-tooltip');
    if (existingTooltip) existingTooltip.remove();
    clearTimeout(timer);
    timer = setTimeout(() => {
      if (!alreadyLeft) render(event.target as HTMLElement);
    }, 300);
  }

  const render = (target: HTMLElement): void => {
    setTimeout(() => {
      const span = document.createElement('span');
      span.classList.add(
        'js-tooltip',
        'invisible',
        'opacity-0',
        'transition-all',
        'duration-200',
        'delay-200',
        'ease-in-out',
        'pointer-events-none',
        'flex',
        'text-xs',
        'normal-case',
        'fixed',
        'z-50'
      );

      // Determine if we're in dark mode
      const isDarkMode =
        document.querySelector('main')?.getAttribute('data-theme') === 'dark';

      // Create the tooltip content first
      span.innerHTML = `
        <span
          style="
            width: max-content;
            color: ${isDarkMode ? 'var(--df-primary)' : 'var(--lf-primary)'};
            background: ${
              isDarkMode ? 'var(--db-secondary)' : 'var(--lb-secondary)'
            };
          "
          class="js-tooltip-content flex shadow-md rounded-md normal-case break-words ${maxWidth}
          px-2 py-1 ${textClass || ''}"
        >
          ${updatedText || text}
        </span>
      `;

      // Add to body instead of target
      document.body.appendChild(span);

      // Calculate position based on target's position in viewport
      const targetRect = target.getBoundingClientRect();
      const tooltipRect = span.getBoundingClientRect();

      // Calculate position
      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = targetRect.top - tooltipRect.height - 8;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          span.style.transform = 'scale(0.95)';
          break;
        case 'bottom':
          top = targetRect.bottom + 8;
          left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
          span.style.transform = 'scale(0.95)';
          break;
        case 'left':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.left - tooltipRect.width - 8;
          span.style.transform = 'scale(0.95)';
          break;
        case 'right':
          top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
          left = targetRect.right + 8;
          span.style.transform = 'scale(0.95)';
          break;
      }

      // Apply positioning
      span.style.top = `${top}px`;
      span.style.left = `${left}px`;

      // Use requestAnimationFrame to ensure the initial state is rendered
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (span) {
            span.classList.remove('invisible', 'opacity-0');
            span.classList.add('visible', 'opacity-100');
            span.style.transform = 'scale(1)';
          }
        });
      });
    });
  };

  const handleLeave = (event: Event): void => {
    if (!(event.target instanceof HTMLElement)) return;
    const tooltip = document.querySelector('.js-tooltip');
    if (tooltip instanceof HTMLElement) {
      tooltip.classList.add('opacity-0');
      tooltip.classList.remove('visible');
      tooltip.classList.add('invisible');
      tooltip.style.transform = 'scale(0.95)';
    }

    alreadyLeft = true;
    setTimeout(() => {
      const tooltip = document.querySelector('.js-tooltip');
      if (tooltip) tooltip.remove();
    }, 200);
  };

  node.addEventListener('mouseenter', handleDebounceEnter);
  node.addEventListener('mouseleave', handleLeave);

  return {
    update: ({
      text,
      position: newPosition,
      maxWidth: newMaxWidth,
    }: TooltipParams): void => {
      if (text) updatedText = text;
      if (newPosition) position = newPosition;
      if (newMaxWidth) maxWidth = newMaxWidth;

      const tooltip = node.querySelector('.js-tooltip-content');
      if (
        tooltip instanceof HTMLElement &&
        text &&
        tooltip.innerText !== text
      ) {
        tooltip.innerText = text;
      }
    },
    destroy(): void {
      node.removeEventListener('mouseenter', handleDebounceEnter);
      node.removeEventListener('mouseleave', handleLeave);
    },
  };
};
