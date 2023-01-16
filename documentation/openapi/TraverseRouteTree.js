class TraverseRouteTree {
  /**
   * Constructor
   *
   * @param routePrefix
   * @param rootRouteFilePath
   */
  constructor(routePrefix, rootRouteFilePath) {
    const oThis = this;

    oThis.routePrefix = routePrefix;
    oThis.rootRouteFilePath = rootRouteFilePath;

    oThis.traversedRouteMap = {};
  }

  /**
   * Perform
   *
   * @returns {{}|*}
   */
  perform() {
    const oThis = this;

    const routeFile = require(oThis.rootRouteFilePath);
    routeFile.stack.forEach(oThis._traverse.bind(oThis, []));

    return oThis.traversedRouteMap;
  }

  /**
   * Traverse
   *
   * @param path
   * @param layer
   * @private
   */
  _traverse(path, layer) {
    const oThis = this;

    if (layer.route) {
      layer.route.stack.forEach(oThis._traverse.bind(oThis, path.concat(oThis._split(layer.route.path))));
    } else if (layer.name === 'router' && layer.handle.stack) {
      layer.handle.stack.forEach(oThis._traverse.bind(oThis, path.concat(oThis._split(layer.regexp))));
    } else if (layer.method) {
      oThis.traversedRouteMap[
        `${layer.method.toUpperCase()} ${oThis.routePrefix}/${path
          .concat(oThis._split(layer.regexp))
          .filter(Boolean)
          .join('/')}`
      ] = 1;
    }
  }

  /**
   * Split
   *
   * @param thing
   * @returns {string|string[]|any}
   * @private
   */
  _split(thing) {
    if (typeof thing === 'string') {
      return thing.split('/');
    } else if (thing.fast_slash) {
      return '';
    }

    const match = thing
      .toString()
      .replace('\\/?', '')
      .replace('(?=\\/|$)', '$')
      .match(/^\/\^((?:\\[.*+?^${}()|[\]\\\/]|[^.*+?^${}()|[\]\\\/])*)\$\//);

    return match ? match[1].replace(/\\(.)/g, '$1').split('/') : '<complex:' + thing.toString() + '>';
  }
}

module.exports = TraverseRouteTree;
