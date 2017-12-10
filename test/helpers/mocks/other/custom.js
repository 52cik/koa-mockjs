/**
 * Custom output
 *
 * @url /custom
 */

module.exports = (ctx) => {
  ctx.body = ctx.query;
  return false;
};
