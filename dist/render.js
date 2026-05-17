export const renderReactEmail = async (component) => {
    const { render } = await import('@react-email/render');
    const [html, text] = await Promise.all([
        render(component),
        render(component, { plainText: true })
    ]);
    return { html, text };
};
