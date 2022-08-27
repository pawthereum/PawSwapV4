export const formatError = (error) => {
  if (error.toString().match(/'(.*?)'/)?.length) {
    return error.toString().match(/'(.*?)'/)[0].replaceAll('\'','');
  }
  if (typeof error === 'object') {
    return JSON.stringify(error);
  }
  return error?.toString();
}

export default formatError;