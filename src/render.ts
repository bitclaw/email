import type { ReactElement } from 'react';

export const renderReactEmail = async (
  component: ReactElement
): Promise<{ html: string; text: string }> => {
  const { render } = await import('@react-email/render');
  const [html, text] = await Promise.all([
    render(component),
    render(component, { plainText: true })
  ]);
  return { html, text };
};
