const getMessageWithParams = (
  message: string,
  params: Record<string, string>,
): string => {
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(`{{${key}}}`, value);
  }, message);
};

export { getMessageWithParams };
