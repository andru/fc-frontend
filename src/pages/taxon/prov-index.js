const provIndex = [];
export default function getProvenanceIndex (provId) {
  const i = provIndex.indexOf(provId);
  if (i > -1) {
    return i + 1;
  }
  provIndex.push(provId);
  return provIndex.length;
}