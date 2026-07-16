const upstreamTransformer = require('@expo/metro-config/babel-transformer');

function stripImportMeta(src) {
  if (!src.includes('import.meta')) return src;
  return src
    .replace(/import\.meta\.url/g, '""')
    .replace(/import\.meta\.env/g, '({})')
    .replace(/import\.meta/g, '({})');
}

module.exports.transform = async function transform(props) {
  const next = {
    ...props,
    src: stripImportMeta(props.src),
  };
  return upstreamTransformer.transform(next);
};
