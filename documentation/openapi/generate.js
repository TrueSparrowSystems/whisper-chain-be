const rootPrefix = '../..';

const fs = require('fs');

const TraverseRouteTree = require(rootPrefix + '/documentation/openapi/TraverseRouteTree'),
  FormatterComposerFactory = require(rootPrefix + '/lib/formatter/composer/Factory');

class GenerateSwaggerSpec {
  /**
   * Constructor
   *
   * @param apiVersion
   */
  constructor(apiVersion) {
    const oThis = this;

    oThis.entityFormatterClassMap = FormatterComposerFactory.getComposer(apiVersion).entityClassMapping;

    oThis.routeIndexFilePath = `/routes/api/${apiVersion}/index`;
    oThis.routesMap = new TraverseRouteTree(`/api/${apiVersion}`, rootPrefix + oThis.routeIndexFilePath).perform();
    oThis.responseSignatures = require(rootPrefix + `/config/apiParams/${apiVersion}/response`);
    oThis.requestSignatures = require(rootPrefix + `/config/apiParams/${apiVersion}/signature`);
    oThis.routeSpecs = require(rootPrefix + `/config/apiParams/${apiVersion}/routeSpec.js`);

    oThis.openapiFilePath = `./config/apiParams/${apiVersion}/openapi.json`;

    oThis.swaggerSpec = {};
  }

  /**
   * Perform
   */
  perform() {
    const oThis = this;

    oThis._initSwaggerSpec();

    for (const route in oThis.routesMap) {
      const routeInfo = oThis.routeSpecs[route];
      const apiName = routeInfo.apiName;
      const responseSignature = oThis.responseSignatures[apiName];
      const paramsSignature = oThis.requestSignatures[apiName];

      const routeParts = route.split(' ');
      const method = routeParts[0].toLowerCase();
      const path = routeParts[1];

      const successResponseSpec = oThis._initSuccessReponseSpec();

      oThis._populateComponentsAndResponseDataSpecs(successResponseSpec, responseSignature);

      oThis._populatePathSpec(method, path, routeInfo, successResponseSpec);

      oThis._populateParamSpecFor(method, path, paramsSignature.mandatory, true);

      oThis._populateParamSpecFor(method, path, paramsSignature.optional, false);
    }

    fs.writeFileSync(oThis.openapiFilePath, JSON.stringify(oThis.swaggerSpec, null, '\t'));
  }

  /**
   * Init swagger spec
   *
   * @private
   */
  _initSwaggerSpec() {
    const oThis = this;

    oThis.swaggerSpec = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Node JS API',
          description: 'REST API implemented using Node JS',
          version: '1.0.0'
        },
        servers: [
          {
            url: 'http://localhost:3000',
            description: 'Local dev server'
          }
        ],
        components: {
          schemas: {}
        },
        paths: {}
      },
      apis: [`.${oThis.routeIndexFilePath}`]
    };
  }

  /**
   * Init success response spec. This will go inside the responses block later.
   *
   * @returns {{description: string, content: {"application/json": {schema: {type: string, properties: {data: {type: string, properties: {}}, success: {type: string, example: boolean}}}}}}}
   * @private
   */
  _initSuccessReponseSpec() {
    return {
      description: 'OK',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: {
                type: 'boolean',
                example: true
              },
              data: {
                type: 'object',
                properties: {}
              }
            }
          }
        }
      }
    };
  }

  /**
   * Populate components and response data specs
   *
   * @param successResponseSpec
   * @param responseSignature
   * @private
   */
  _populateComponentsAndResponseDataSpecs(successResponseSpec, responseSignature) {
    const oThis = this;

    const dataPropsRef = successResponseSpec.content['application/json'].schema.properties.data.properties;

    for (const internalEnt in responseSignature.entityKindToResponseKeyMap) {
      const externalEnt = responseSignature.entityKindToResponseKeyMap[internalEnt];

      if (externalEnt === 'meta') {
        // For meta, do not include in components. Put the schema in response data.
        // Reason: Meta can not be generic. It is API specific.

        dataPropsRef[externalEnt] = oThis.entityFormatterClassMap[internalEnt].schema();
      } else {
        oThis.swaggerSpec.definition.components.schemas[externalEnt] = oThis.entityFormatterClassMap[
          internalEnt
        ].schema();

        dataPropsRef[externalEnt] = {
          $ref: `#/components/schemas/${externalEnt}`
        };
      }
    }

    if (responseSignature.resultType && responseSignature.resultTypeLookup) {
      dataPropsRef.result_type = {
        type: 'string',
        example: responseSignature.resultType
      };

      dataPropsRef.result_type_lookup = {
        type: 'string',
        example: responseSignature.resultTypeLookup
      };
    }
  }

  /**
   * Populate path spec
   *
   * @param method
   * @param path
   * @param routeInfo
   * @param successResponseSpec
   * @private
   */
  _populatePathSpec(method, path, routeInfo, successResponseSpec) {
    const oThis = this;

    const routeSummary = routeInfo.summary;
    const routeTag = routeInfo.tag;
    const routeDescription = routeInfo.description;

    oThis.swaggerSpec.definition.paths[path] = oThis.swaggerSpec.definition.paths[path] || {};

    oThis.swaggerSpec.definition.paths[path][method] = {
      summary: routeSummary,
      tags: [routeTag],
      parameters: [],
      responses: {
        '200': successResponseSpec
      }
    };

    if (routeDescription) {
      oThis.swaggerSpec.definition.paths[path][method].description = routeDescription;
    }
  }

  /**
   * Populate parameter spec
   *
   * @param method
   * @param path
   * @param paramSigArr
   * @param isRequired
   * @private
   */
  _populateParamSpecFor(method, path, paramSigArr, isRequired) {
    const oThis = this;

    for (const paramSig of paramSigArr) {
      if (paramSig.kind == 'internal') {
        continue;
      }

      let paramIn = null;
      if (path.split('/').includes(`:${paramSig.parameter}`)) {
        paramIn = 'path';
      } else if (method == 'get') {
        paramIn = 'query string';
      } else {
        paramIn = 'request body';
      }

      const paramSpec = {
        in: paramIn,
        name: paramSig.parameter,
        required: isRequired,
        schema: {
          type: paramSig.type
        }
      };

      if (paramSig.description) {
        paramSpec.description = paramSig.description;
      }

      oThis.swaggerSpec.definition.paths[path][method].parameters.push(paramSpec);
    }
  }
}

new GenerateSwaggerSpec('web').perform();

new GenerateSwaggerSpec('v1').perform();
