async function getTypes() {
  const types = await eval(`import("@biosfera/types ")`);

  return types;
}
export default getTypes;
