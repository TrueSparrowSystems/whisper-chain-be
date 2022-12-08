/**
 *
 * Form mysql query <br><br>
 *
 *
 * Max supported SELECT query:
 * SELECT [columns]
 *   FROM [table]
 *   WHERE [where conditions]
 *   GROUP BY [columns]
 *   ORDER BY [order by columns]
 *   HAVING [having condition]
 *   LIMIT [limit and offset];
 *
 * Max supported INSERT query:
 * INSERT INTO [table] ([columns])
 *   VALUES ([values]), ([values])
 *   ON DUPLICATE KEY UPDATE [conditions];
 *
 * Max supported UPDATE query:
 * UPDATE [table]
 *   SET [column=value], [column=value]
 *   WHERE [where conditions]
 *   ORDER BY [order by columns]
 *   LIMIT [limit];
 *
 * Max supported DELETE query:
 * DELETE FROM [table]
 *   WHERE [where conditions]
 *   ORDER BY [order by columns]
 *   LIMIT [limit];
 *
 * @module lib/query_builder/mysql
 *
 */

const rootPrefix = '../..',
  logger = require(rootPrefix + '/lib/logger/customConsoleLogger'),
  basicHelper = require(rootPrefix + '/helpers/basic'),
  responseHelper = require(rootPrefix + '/lib/formatter/response');

/**
 *
 * MySQL query builder constructor
 *
 * @param {Object} params -
 * @param {String} [params.table_name] - MySQL table name for which query need to be build
 *
 * @constructor
 *
 */
class MySqlQueryBuilder {
  constructor(params) {
    const oThis = this;

    oThis.tableName = oThis.tableName || (params || {}).table_name;

    oThis.queryType = null;

    // Select query type
    oThis.selectSubQueries = [];
    oThis.selectSubQueriesReplacement = [];

    // Insert, Bulk Insert query type
    oThis.insertIntoColumns = [];
    oThis.insertIntoColumnValues = [];

    oThis.defaultUpdatedAttributes = {};

    // Update query type
    oThis.updateSubQueries = [];
    oThis.updateSubQueriesReplacement = [];
    oThis.touchUpdatedAt = true;

    // Delete Query type has no specific parameters

    // --- common variables ---

    // Used in Select, Delete, Update Query
    oThis.whereSubQueries = [];
    oThis.whereSubQueriesReplacement = [];

    // Used in Select, Delete, Update Query
    oThis.orderBySubQueries = [];
    oThis.orderBySubQueriesReplacement = [];

    // Used in Select, Delete, Update Query
    oThis.selectLimit = 0;

    // Used only with Select Query
    oThis.selectOffset = 0;

    // Used only with Select Query
    oThis.groupBySubQueries = [];
    oThis.groupBySubQueriesReplacement = [];

    // Used only with Select Query
    oThis.havingSubQueries = [];
    oThis.havingSubQueriesReplacement = [];

    // Used only with INSERT Query
    oThis.onDuplicateSubQueries = [];
    oThis.onDuplicateSubQueriesReplacement = [];

    // Used only with INSERT Query
    oThis.ignoreInsertError = false;

    return oThis;
  }

  /**
   * List of fields to be selected from table. If called multiple times, select columns will be joined by COMMA.
   *
   * Possible data types:
   * * blank/undefined - '*' will be used to fetch all columns
   * * Array - list of field names will be joined by comma
   * * String - list of field names will be used as it is
   *
   * Example 1: '*' will be used to fetch all columns
   * select()
   *
   * Example 2: list of field names in array. Will be joined by comma
   * select(['name', 'created_at'])
   *
   * Example 3: list of field names in string. Will be used as it is
   * select('name, created_at')
   *
   * @return {object<self>} oThis
   */
  select(fields) {
    const oThis = this;

    if (![undefined, null, '', 'SELECT'].includes(oThis.queryType)) {
      throw new Error('Multiple type of query statements in single query builder object');
    }

    oThis.queryType = 'SELECT';

    if (fields === undefined || fields === '') {
      // If fields are not mentioned, fetch all columns
      oThis.selectSubQueries.push(oThis.tableName + '.*');
    } else if (Array.isArray(fields)) {
      // List of columns will be fetched
      oThis.selectSubQueries.push('??');
      oThis.selectSubQueriesReplacement.push(fields);
    } else if (typeof fields === 'string') {
      // Custom columns list will be fetched
      oThis.selectSubQueries.push(fields);
    } else {
      throw new Error('Unsupported data type for fields in SELECT clause');
    }

    return oThis;
  }

  /**
   * Insert single record in table. Method can't be called twice on same object
   *
   * Example 1: Insert in object format.
   * insert({name: 'XYZ', id: 10})
   *
   * @param insertFields {object} - key and value pairs of columns and values to be inserted
   * @param insertOptions {object}
   * @param insertOptions.touch {object} - if true, auto insert created_at and updated_at values. Default is true.
   *
   * @return {object<self>} oThis
   */
  insert(insertFields, insertOptions) {
    const oThis = this;

    if (typeof insertFields !== 'object') {
      throw new Error('Unsupported INSERT fields data type');
    }

    const insertColumns = Object.keys(insertFields),
      insertValues = Object.values(insertFields);

    insertOptions = insertOptions || {};

    return oThis.insertMultiple(insertColumns, [insertValues], insertOptions);
  }

  /**
   * Insert multiple records in table. Method can't be called twice on same object
   *
   * Example 1:
   * insertMultiple(['name', 'symbol'], [['ABC', '123'], ['ABD', '456']])
   *
   * @param insertColumns {array} - list of columns. also columns are mandatory
   * @param insertValues {array} - array of array with values
   * @param [insertOptions] {object}
   *
   * @returns {MySqlQueryBuilder}
   */
  insertMultiple(insertColumns, insertValues, insertOptions) {
    const oThis = this,
      touchTimestampColumns = (insertOptions || {}).touch === false ? false : true,
      currentDate = Math.round(new Date() / 1000);

    insertOptions = insertOptions || {};

    if (![undefined, null, ''].includes(oThis.queryType)) {
      throw new Error('Multiple type of query statements in single query builder object');
    }

    oThis.queryType = 'INSERT';

    if (insertOptions.withIgnore) {
      oThis.ignoreInsertError = true;
    }

    if (!Array.isArray(insertColumns) || insertColumns.length == 0) {
      throw new Error('Unsupported INSERT columns data type');
    }

    if (!Array.isArray(insertValues)) {
      throw new Error('Unsupported INSERT values data type');
    }

    // Insert columns can be left empty
    oThis.insertIntoColumns = insertColumns;

    // Manage created_at and updated_at columns
    let createdAtDateTime = null,
      updatedAtDateTime = null;
    if (touchTimestampColumns) {
      if (!oThis.insertIntoColumns.includes('updated_at')) {
        oThis.insertIntoColumns.push('updated_at');
        updatedAtDateTime = currentDate;
        oThis.defaultUpdatedAttributes['updated_at'] = updatedAtDateTime;
      }
      if (!oThis.insertIntoColumns.includes('created_at')) {
        oThis.insertIntoColumns.push('created_at');
        createdAtDateTime = currentDate;
        oThis.defaultUpdatedAttributes['created_at'] = createdAtDateTime;
      }
    }

    // Insert values
    const totalColumnsToInsert = oThis.insertIntoColumns.length;
    for (let index = 0; index < insertValues.length; index++) {
      // Add timestamp column values
      if (updatedAtDateTime !== null) {
        insertValues[index].push(updatedAtDateTime);
      }
      if (createdAtDateTime !== null) {
        insertValues[index].push(createdAtDateTime);
      }

      if (totalColumnsToInsert != insertValues[index].length) {
        logger.error('totalColumnsToInsert', totalColumnsToInsert);
        logger.error('insertValues[i]', insertValues[index]);
        throw new Error('Column length is not equal to value length');
      }
    }
    oThis.insertIntoColumnValues = insertValues;

    return oThis;
  }

  /**
   * Update columns to be applied to the query. If called multiple times, update fields will be joined by {,}.
   *
   * Possible data types:
   * * Array - index 0 should have the update sub query and other indexes should have the valued to be replaced in sub query
   * * Object - key and value pairs of columns and values to be joined by COMMA to form update sub query
   * * String - update sub query, used as it is.
   *
   * @param updateFields - refer possible data types
   * @param insertOptions -
   * @param [insertOptions.touch] - if true, auto insert created_at and updated_at values. Default is true.
   *
   * Example 1: update in array format
   * update(['name=?, id=?', 'XYZ', 10])
   *
   * Example 2: Update in object format. Fields will be joined by {,}
   * update({name: 'XYZ', id: 10})
   *
   * Example 3: Update in string. Will be used as it is
   * update('id=10')
   *
   * @return {object<self>} oThis
   */
  update(updateFieldsParam, insertOptions) {
    const oThis = this;

    const updateFields = basicHelper.deepDup(updateFieldsParam);

    // Validations
    if (updateFields === undefined || updateFields === '') {
      throw new Error('UPDATE fields can not be blank');
    }

    oThis.queryType = 'UPDATE';

    if (typeof updateFields === 'string') {
      // Simply push string to sub-queries array
      oThis.updateSubQueries.push(updateFields);
    } else if (Array.isArray(updateFields)) {
      // Extract first element and push it to sub-queries array
      oThis.updateSubQueries.push(updateFields.shift());

      // Remain array will be concatenated at the end of replacement array
      if (updateFields.length > 0) {
        oThis.updateSubQueriesReplacement = oThis.updateSubQueriesReplacement.concat(updateFields);
      }
    } else if (typeof updateFields === 'object') {
      // Extract keys and values in different arrays.
      // For sub-queries create string locally and push it to sub-queries array by joining with AND.
      // Also push key and value alternatively in local replacement array.
      const updateColumns = Object.keys(updateFields),
        updateValues = Object.values(updateFields),
        localSubQueries = [],
        localReplacements = [];

      if (updateColumns.length > 0) {
        for (let index = 0; index < updateColumns.length; index++) {
          localSubQueries.push('??=?');
          localReplacements.push(updateColumns[index]);
          localReplacements.push(updateValues[index]);
        }
        oThis.updateSubQueries.push(localSubQueries.join(', '));
        oThis.updateSubQueriesReplacement = oThis.updateSubQueriesReplacement.concat(localReplacements);
      } else {
        throw new Error('Unsupported data type for UPDATE clause');
      }
    } else {
      throw new Error('Unsupported data type for UPDATE clause');
    }

    // Manage updated_at column
    if (oThis.touchUpdatedAt !== false) {
      oThis.touchUpdatedAt = (insertOptions || {}).touch === false ? false : true;
    }

    return oThis;
  }

  /**
   * Delete row from table.
   *
   * Example 1:
   * delete()
   *
   * @return {object<self>} oThis
   */
  delete() {
    const oThis = this;

    if (![undefined, null, ''].includes(oThis.queryType)) {
      throw new Error('Multiple type of query statements in single query builder object');
    }

    oThis.queryType = 'DELETE';

    return oThis;
  }

  /**
   * Where conditions to be applied to the query. If called multiple times, where conditions will be joined by AND.
   *
   * Possible data types:
   * * Array - index 0 should have the where sub query and other indexes should have the valued to be replaced in sub query
   * * Object - key and value pairs of columns and values to be joined by AND to form where sub query
   * * String - where sub query, used as it is.
   *
   * Example 1: Where in array format
   * where(['name=? AND id=?', 'XYZ', 10])
   *
   * Example 2: Where in object format. Conditions will be joined by AND
   * where({name: 'XYZ', id: 10})
   * where({name: [1,2,3], id: 10})
   *
   * Example 3: condition in string. Will be used as it is
   * where('id=10')
   *
   * @return {object<self>} oThis
   */
  where(whereConditionsParam) {
    const oThis = this;

    const whereConditions = basicHelper.deepDup(whereConditionsParam);

    // Validations
    if (!['SELECT', 'UPDATE', 'DELETE'].includes(oThis.queryType)) {
      throw new Error('Please select the query type before WHERE clause. Current query type: ' + oThis.queryType);
    }
    if (whereConditions === undefined || whereConditions === '') {
      throw new Error('WHERE condition can not be blank');
    }

    if (typeof whereConditions === 'string') {
      // Simply push string to sub-queries array
      oThis.whereSubQueries.push(whereConditions);
    } else if (Array.isArray(whereConditions)) {
      // Extract first element and push it to sub-queries array
      oThis.whereSubQueries.push(whereConditions.shift());

      // Remain array will be concatenated at the end of replacement array
      if (whereConditions.length > 0) {
        oThis.whereSubQueriesReplacement = oThis.whereSubQueriesReplacement.concat(whereConditions);
      }
    } else if (typeof whereConditions === 'object') {
      // Extract keys and values in different arrays.
      // For sub-queries create string locally and push it to sub-queries array by joining with AND.
      // Also push key and value alternatively in local replacement array.
      const whereColumns = Object.keys(whereConditions),
        whereValues = Object.values(whereConditions),
        localSubQueries = [],
        localReplacements = [];

      if (whereColumns.length > 0) {
        for (let index = 0; index < whereColumns.length; index++) {
          if (Array.isArray(whereValues[index])) {
            localSubQueries.push('?? IN (?)');
          } else {
            localSubQueries.push('??=?');
          }
          localReplacements.push(whereColumns[index]);
          localReplacements.push(whereValues[index]);
        }
        oThis.whereSubQueries.push(localSubQueries.join(' AND '));
        oThis.whereSubQueriesReplacement = oThis.whereSubQueriesReplacement.concat(localReplacements);
      } else {
        throw new Error('Unsupported data type for WHERE clause');
      }
    } else {
      throw new Error('Unsupported data type for WHERE clause');
    }

    return oThis;
  }

  /**
   * List of fields to be grouped by from table. If called multiple times, group by conditions will be joined by COMMA.
   *
   * Possible data types:
   * * Array - list of field names will be joined by comma
   * * String - list of field names will be used as it is
   *
   * Example 1:
   * group_by(['name', 'created_at'])
   *
   * Example 2:
   * group_by('name, created_at')
   *
   * @return {object<self>} oThis
   */
  group_by(groupByConditions) {
    const oThis = this;

    // Validations
    if (!['SELECT'].includes(oThis.queryType)) {
      throw new Error('Please select the query type before GROUP BY. Current query type: ' + oThis.queryType);
    }
    if (groupByConditions === undefined || groupByConditions === '') {
      throw new Error('GROUP BY condition can not be blank');
    }

    if (Array.isArray(groupByConditions)) {
      // List of columns to be group by on
      oThis.groupBySubQueries.push('??');
      oThis.groupBySubQueriesReplacement.push(groupByConditions);
    } else if (typeof groupByConditions === 'string') {
      // Custom columns list will be fetched
      oThis.groupBySubQueries.push(groupByConditions);
    } else {
      throw new Error('Unsupported data type for GROUP BY');
    }

    return oThis;
  }

  /**
   * List of fields to be ordered by from table. If called multiple times, order by conditions will be joined by COMMA.
   *
   * Possible data types:
   * * Object - where keys are column names and value is order
   * * String - order will be used as it is
   *
   * @param orderByConditions - refer possible data types
   * @param orderByOptions -
   * @param [orderByOptions.useField] - if true, use Field Order logic. Default is false.
   *
   * Example 1:
   * order_by({'name': 'ASC', 'created_at': 'DESC'})
   *
   * Example 2:
   * order_by('name ASC, created_at DESC')
   *
   * Example 3:
   * order_by(['ID', [1, 5, 4, 3]], {useField: true})
   *
   * Example 4:
   * order_by([1, 2, 3])
   *
   * @return {object<self>} oThis
   */
  order_by(orderByConditions, orderByOptions = {}) {
    const oThis = this;

    // Validations
    if (!['SELECT', 'UPDATE', 'DELETE'].includes(oThis.queryType)) {
      throw new Error('Please select the query type before ORDER BY. Current query type: ' + oThis.queryType);
    }
    if (orderByConditions === undefined || orderByConditions === '') {
      throw new Error('ORDER BY condition can not be blank');
    }

    if (Array.isArray(orderByConditions)) {
      if (orderByOptions.useField) {
        oThis.orderBySubQueries.push('FIELD(?? , ?)');
        oThis.orderBySubQueriesReplacement.push(orderByConditions[0]);
        oThis.orderBySubQueriesReplacement.push(orderByConditions[1]);
      } else {
        // List of columns to be group by on
        oThis.orderBySubQueries.push('??');
        oThis.orderBySubQueriesReplacement.push(orderByConditions);
      }
    } else if (typeof orderByConditions === 'object') {
      // Extract keys and values in different arrays.
      // For sub-queries create string locally and push it to sub-queries array by joining with COMMA.
      // Also push key and value alternatively in local replacement array.
      const orderColumns = Object.keys(orderByConditions),
        orderValues = Object.values(orderByConditions),
        localSubQueries = [],
        localReplacements = [];

      if (orderColumns.length > 0) {
        for (let i = 0; i < orderColumns.length; i++) {
          localSubQueries.push('?? ' + (orderValues[i].toUpperCase() == 'DESC' ? 'DESC' : 'ASC'));
          localReplacements.push(orderColumns[i]);
        }
        oThis.orderBySubQueries.push(localSubQueries.join(', '));
        oThis.orderBySubQueriesReplacement = oThis.orderBySubQueriesReplacement.concat(localReplacements);
      } else {
        throw new Error('Unsupported data type for ORDER BY');
      }
    } else if (typeof orderByConditions === 'string') {
      // Custom columns list will be fetched
      oThis.orderBySubQueries.push(orderByConditions);
    } else {
      throw new Error('Unsupported data type for ORDER BY');
    }

    return oThis;
  }

  /**
   * List of fields for having clause. If called multiple times, having conditions will be joined by AND.
   *
   * Possible data types:
   * * Array - index 0 should have the having sub query and other indexes should have the valued to be replaced in sub query
   * * String - where sub query, used as it is.
   *
   * Example 1: Where in array format
   * having(['MIN(`salary`) < ?', 10])
   *
   * Example 2: condition in string. Will be used as it is
   * having('MIN(`salary`) < 10')
   *
   * @return {object<self>} oThis
   */
  having(havingConditionsParam) {
    const oThis = this;

    const havingConditions = basicHelper.deepDup(havingConditionsParam);

    // Validations
    if (!['SELECT'].includes(oThis.queryType)) {
      throw new Error('Please select the query type before HAVING condition. Current query type: ' + oThis.queryType);
    }
    if (havingConditions === undefined || havingConditions === '') {
      throw new Error('HAVING condition can not be blank');
    }

    if (typeof havingConditions === 'string') {
      // Simply push string to sub-queries array
      oThis.havingSubQueries.push(havingConditions);
    } else if (Array.isArray(havingConditions)) {
      // Extract first element and push it to sub-queries array
      oThis.havingSubQueries.push(havingConditions.shift());

      // Remaining array will be concatenated at the end of replacement array
      if (havingConditions.length > 0) {
        oThis.havingSubQueriesReplacement = oThis.havingSubQueriesReplacement.concat(havingConditions);
      }
    } else {
      throw new Error('Unsupported data type for HAVING');
    }

    return oThis;
  }

  /**
   * Limit of records to be fetched. If called multiple times, it will overwrite the previous value
   *
   * Example 1:
   * limit(100)
   *
   * @param recordsLimit {number} recordsLimit - limit for select query
   *
   * @return {object<self>} oThis
   */
  limit(recordsLimit) {
    const oThis = this;

    // Validations
    if (!['SELECT', 'UPDATE', 'DELETE'].includes(oThis.queryType)) {
      throw new Error('Please select the query type before LIMIT. Current query type: ' + oThis.queryType);
    }

    if (parseInt(recordsLimit) > 0) {
      // Simply use the number in limit clause
      oThis.selectLimit = parseInt(recordsLimit);
    } else {
      throw new Error('Unsupported data type for select LIMIT');
    }

    return oThis;
  }

  /**
   * Offset for records to be fetched. If called multiple times, it will overwrite the previous value. limit is mandatory for offset
   *
   * Example 1:
   * offset(10)
   *
   * @param recordsOffset {number} recordsOffset - offset for select query
   *
   * @return {object<self>} oThis
   */
  offset(recordsOffset) {
    const oThis = this;

    // Validations
    if (!['SELECT'].includes(oThis.queryType)) {
      throw new Error('Please select the query type before OFFSET. Current query type: ' + oThis.queryType);
    }

    if (parseInt(recordsOffset) >= 0) {
      // Simply use the number in limit clause
      oThis.selectOffset = parseInt(recordsOffset);
    } else {
      throw new Error('Unsupported data type for select OFFSET');
    }

    return oThis;
  }

  /**
   * On Duplicate conditions to be applied to the INSERT query. If called multiple times, conditions will be joined by COMMA.
   *
   * Possible data types:
   * * Array - index 0 should have the On Duplicate sub query and other indexes should have the valued to be replaced in sub query
   * * Object - key and value pairs of columns and values to be joined by COMMA to form On Duplicate sub query
   * * String - sub query, used as it is.
   *
   * Example 1: ON DUPLICATE in array format
   * onDuplicate(['name=? , id=?', 'XYZ', 10])
   *
   * Example 2: ON DUPLICATE in object format. Conditions will be joined by ,
   * onDuplicate({name: 'XYZ', id: 10})
   *
   * Example 3: ON DUPLICATE in string. Will be used as it is
   * onDuplicate('id=10')
   *
   * @return {object<self>} oThis
   */
  onDuplicate(onDuplicateConditionsParam) {
    const oThis = this;

    const onDuplicateConditions = basicHelper.deepDup(onDuplicateConditionsParam);

    // Validations
    if (!['INSERT'].includes(oThis.queryType)) {
      throw new Error(
        'Please select the query type before ON DUPLICATE clause. Current query type: ' + oThis.queryType
      );
    }
    if (onDuplicateConditions === undefined || onDuplicateConditions === '') {
      throw new Error('ON DUPLICATE condition can not be blank');
    }

    if (typeof onDuplicateConditions === 'string') {
      // Simply push string to sub-queries array
      oThis.onDuplicateSubQueries.push(onDuplicateConditions);
    } else if (Array.isArray(onDuplicateConditions)) {
      // Extract first element and push it to sub-queries array
      oThis.onDuplicateSubQueries.push(onDuplicateConditions.shift());

      // Remain array will be concatenated at the end of replacement array
      if (onDuplicateConditions.length > 0) {
        oThis.onDuplicateSubQueriesReplacement = oThis.onDuplicateSubQueriesReplacement.concat(onDuplicateConditions);
      }
    } else if (typeof onDuplicateConditions === 'object') {
      // Extract keys and values in different arrays.
      // For sub-queries create string locally and push it to sub-queries array by joining with COMMA.
      // Also push key and value alternatively in local replacement array.
      const onDuplicateColumns = Object.keys(onDuplicateConditions),
        onDuplicateValues = Object.values(onDuplicateConditions),
        localSubQueries = [],
        localReplacements = [];

      if (onDuplicateColumns.length > 0) {
        for (let index = 0; index < onDuplicateColumns.length; index++) {
          localSubQueries.push('??=?');
          localReplacements.push(onDuplicateColumns[index]);
          localReplacements.push(onDuplicateValues[index]);
        }
        oThis.onDuplicateSubQueries.push(localSubQueries.join(', '));
        oThis.onDuplicateSubQueriesReplacement = oThis.onDuplicateSubQueriesReplacement.concat(localReplacements);
      } else {
        throw new Error('Unsupported data type for ON DUPLICATE clause');
      }
    } else {
      throw new Error('Unsupported data type for ON DUPLICATE clause');
    }

    return oThis;
  }

  /**
   * Generate final query supported by mysql node module
   *
   * @return {object<response>}
   */
  generate() {
    const oThis = this;

    if (oThis.queryType === 'SELECT') {
      return oThis._generateSelect();
    } else if (oThis.queryType == 'INSERT') {
      return oThis._generateInsert();
    } else if (oThis.queryType == 'UPDATE') {
      return oThis._generateUpdate();
    } else if (oThis.queryType == 'DELETE') {
      return oThis._generateDelete();
    } else if (oThis.queryType == 'DESCRIBE') {
      return oThis._generateDesc();
    } else if (oThis.queryType == 'SHOW') {
      return oThis._generateShowColumns();
    } else {
      throw new Error('Unsupported query type');
    }
  }

  /**
   * Generate the final SELECT statement
   *
   * @private
   */
  _generateSelect() {
    const oThis = this;

    // Select query generation starts
    let queryString = oThis.queryType,
      queryData = [];

    // Select part of the query and it's data part
    if (oThis.selectSubQueries.length === 0) {
      // Put * if no select mentioned ??
      throw new Error('What do you want to select? Please mention.');
    }
    queryString += ' ' + oThis.selectSubQueries.join(', ');
    queryData = queryData.concat(oThis.selectSubQueriesReplacement);

    // If table name is present, generate the rest of the query and it's data
    if (oThis.tableName) {
      // From part of the query and it's data part
      queryString += ' FROM ??';
      queryData.push(oThis.tableName);

      if (oThis.whereSubQueries.length > 0) {
        queryString += ' WHERE (' + oThis.whereSubQueries.join(') AND (') + ')';
        queryData = queryData.concat(oThis.whereSubQueriesReplacement);
      }

      if (oThis.groupBySubQueries.length > 0) {
        queryString += ' GROUP BY ' + oThis.groupBySubQueries.join(', ');
        queryData = queryData.concat(oThis.groupBySubQueriesReplacement);
      }

      if (oThis.havingSubQueries.length > 0) {
        queryString += ' HAVING (' + oThis.havingSubQueries.join(') AND (') + ')';
        queryData = queryData.concat(oThis.havingSubQueriesReplacement);
      }

      if (oThis.orderBySubQueries.length > 0) {
        queryString += ' ORDER BY ' + oThis.orderBySubQueries.join(', ');
        queryData = queryData.concat(oThis.orderBySubQueriesReplacement);
      }

      if (oThis.selectLimit > 0) {
        queryString += ' LIMIT ' + (oThis.selectOffset > 0 ? oThis.selectOffset + ', ' : '') + oThis.selectLimit;
      }
    }

    return responseHelper.successWithData({ query: queryString, queryData: queryData });
  }

  /**
   * Generate the final INSERT statement
   *
   * @private
   */
  _generateInsert() {
    const oThis = this;

    // Insert query generation starts
    let queryString = oThis.queryType,
      queryData = [];

    // Insert columns should be present
    if (oThis.insertIntoColumns.length === 0) {
      throw new Error('What do you want to insert? Please mention.');
    }

    if (!oThis.tableName) {
      throw new Error('No Table Name given. Please mention.');
    }

    if (oThis.ignoreInsertError) {
      queryString += ' IGNORE';
    }

    // From part of the query and it's data part
    queryString += ' INTO ??';
    queryData.push(oThis.tableName);

    queryString += ' (??)';
    queryData.push(oThis.insertIntoColumns);

    queryString += ' VALUES ?';
    queryData.push(oThis.insertIntoColumnValues);

    if (oThis.onDuplicateSubQueries.length > 0) {
      queryString += ' ON DUPLICATE KEY UPDATE ' + oThis.onDuplicateSubQueries.join(', ');
      queryData = queryData.concat(oThis.onDuplicateSubQueriesReplacement);
    }

    return responseHelper.successWithData({
      query: queryString,
      queryData: queryData,
      defaultUpdatedAttributes: oThis.defaultUpdatedAttributes
    });
  }

  /**
   * Generate the final DELETE statement
   *
   * @private
   */
  _generateDelete() {
    const oThis = this;

    // Delete query generation starts
    let queryString = oThis.queryType,
      queryData = [],
      queryWithoutWhere = true;

    if (!oThis.tableName) {
      throw new Error('No Table Name given. Please mention.');
    }

    // From part of the query and it's data part
    queryString += ' FROM ??';
    queryData.push(oThis.tableName);

    if (oThis.whereSubQueries.length > 0) {
      queryString += ' WHERE (' + oThis.whereSubQueries.join(') AND (') + ')';
      queryData = queryData.concat(oThis.whereSubQueriesReplacement);
      queryWithoutWhere = false;
    }

    if (oThis.orderBySubQueries.length > 0) {
      queryString += ' ORDER BY ' + oThis.orderBySubQueries.join(', ');
      queryData = queryData.concat(oThis.orderBySubQueriesReplacement);
    }

    if (oThis.selectLimit > 0) {
      queryString += ' LIMIT ' + oThis.selectLimit;
    }

    // When where condition is not mentioned, query will be returned in a different key
    if (queryWithoutWhere) {
      return responseHelper.successWithData({ dangerQuery: queryString, queryData: queryData });
    } else {
      return responseHelper.successWithData({ query: queryString, queryData: queryData });
    }
  }

  /**
   * Generate the final UPDATE statement
   *
   * @private
   */
  _generateUpdate() {
    const oThis = this;

    const currentDate = Math.round(new Date() / 1000);

    // Update query generation starts
    let queryString = oThis.queryType,
      queryData = [];

    if (!oThis.tableName) {
      throw new Error('No Table Name given. Please mention.');
    }

    // From part of the query and it's data part
    queryString += ' ??';
    queryData.push(oThis.tableName);

    if (oThis.updateSubQueries.length == 0) {
      throw new Error('No update fields selected');
    }

    // Manage updated_at column
    if (oThis.touchUpdatedAt) {
      oThis.updateSubQueries.push('updated_at=?');
      oThis.updateSubQueriesReplacement = oThis.updateSubQueriesReplacement.concat([currentDate]);
      oThis.defaultUpdatedAttributes['updated_at'] = currentDate;
    }

    queryString += ' SET ' + oThis.updateSubQueries.join(', ');
    queryData = queryData.concat(oThis.updateSubQueriesReplacement);

    if (oThis.whereSubQueries.length > 0) {
      queryString += ' WHERE (' + oThis.whereSubQueries.join(') AND (') + ')';
      queryData = queryData.concat(oThis.whereSubQueriesReplacement);
    }

    if (oThis.orderBySubQueries.length > 0) {
      queryString += ' ORDER BY ' + oThis.orderBySubQueries.join(', ');
      queryData = queryData.concat(oThis.orderBySubQueriesReplacement);
    }

    if (oThis.selectLimit > 0) {
      queryString += ' LIMIT ' + oThis.selectLimit;
    }

    return responseHelper.successWithData({
      query: queryString,
      queryData: queryData,
      defaultUpdatedAttributes: oThis.defaultUpdatedAttributes
    });
  }

  /**
   * For table description: DESCRIBE table_name
   * @returns {MySqlQueryBuilder}
   */
  describe() {
    const oThis = this;

    if (![undefined, null, '', 'DESCRIBE'].includes(oThis.queryType)) {
      throw new Error('Multiple type of query statements in single query builder object');
    }

    oThis.queryType = 'DESCRIBE';

    return oThis;
  }

  /**
   * Generate actual query for describe function
   * @returns {*|result}
   * @private
   */
  _generateDesc() {
    const oThis = this;

    let queryString = oThis.queryType;
    const queryData = [];

    if (oThis.tableName) {
      queryString += ' ??';
      queryData.push(oThis.tableName);
    }

    return responseHelper.successWithData({ query: queryString, queryData: queryData });
  }

  /**
   * Sets query type to SHOW.
   *
   * @returns {MySqlQueryBuilder}
   */
  showColumns() {
    const oThis = this;

    if (![undefined, null, '', 'SHOW'].includes(oThis.queryType)) {
      throw new Error('Multiple type of query statements in single query builder object');
    }

    oThis.queryType = 'SHOW';

    return oThis;
  }

  /**
   * Generates SHOW columns
   *
   * @returns {*|result}
   * @private
   */
  _generateShowColumns() {
    const oThis = this;

    let queryString = oThis.queryType;
    const queryData = [];

    queryString += ' COLUMNS FROM ';

    if (oThis.tableName) {
      queryString += ' ??';
      queryData.push(oThis.tableName);
    }

    return responseHelper.successWithData({
      query: queryString,
      queryData: queryData
    });
  }
}

module.exports = MySqlQueryBuilder;
