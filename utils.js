const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

function delay(time) {
  return new Promise(resolve => setTimeout(resolve, time));
}

function paginationSort(array, params) {
  let sortContent = array;

  let sort = null;
  if (params.sort) {
    sort = params.sort.split(',')
  }

  if (sort?.[0] && sort?.[1]) {
    sortContent = array.sort((a, b) => {
      if (a[sort[0]] > b[sort[0]]) {
        return sort[1] === 'asc' ? 1 : -1;
      }
      if (a[sort[0]] < b[sort[0]]) {
        return sort[1] === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  if (params.size === 0) {
    return sortContent
  }

  if (params.page && params.size) {
    const page = parseInt(params.page)
    const size = parseInt(params.size)
    return sortContent.filter((e, i) => {
      return i < (page + 1) * size && i >= (page * size)
    });
  }

  return sortContent;
}

function deleteById(array, id) {
  array.splice(array.findIndex(i => i.id.toString() === id[1]), 1);
}

function deleteByIds(array, ids, absolutePath) {
  const newArray = array.filter(x => !ids.includes(x.id))
  fs.writeFileSync(absolutePath, JSON.stringify(newArray, null, 2), 'utf-8')
  return newArray
}

function deleteByArchivIds(array, ids, absolutePath) {
  const newArray = array.filter(x => !ids.includes(x.archivId))
  fs.writeFileSync(absolutePath, JSON.stringify(newArray, null, 2), 'utf-8')
  return newArray
}

function createElem(array, data) {
  const elem = {
    ...data,
    id: array[array.length - 1].id + 1
  }
  array.unshift(elem)
  return elem;
}

function putElemById(array, data, id, absolutePath) {
  const index = array.findIndex(i => i.id.toString() === id)
  array[index] = data;
  fs.writeFileSync(absolutePath, JSON.stringify(array, null, 2), 'utf-8')
}

function putElemToCMSById(array, data, id, absolutePath) {
  const index = array.findIndex(i => i.userId.toString() === id)
  array[index].user_properties = data;
  fs.writeFileSync(absolutePath, JSON.stringify(array, null, 2), 'utf-8')
}

const dateToTimestamp = (str, last = true) => {
  const date = new Date(str);
  if (!last) date.setUTCHours(23,59,59,999)
  return date.getTime()
} 

function filterSort(array, params) {
  let filterParams = params, key;
  let filterArray = array;

  for (key in filterParams) {
    if (!key.startsWith('filter')) continue;
    if (key.split('.').length > 2) {
      const filterKey = key.split('.')[1]
      const paramsKey = key.split('.')[2]
      filterArray = filterArray.filter(elem => {
        return paramsKey === 'dateFrom' ? dateToTimestamp(filterParams[`filter.${filterKey}.dateFrom`]) <= elem[filterKey] : elem[filterKey] <= dateToTimestamp(filterParams[`filter.${filterKey}.dateTo`], false);
      })
    } else {
      const paramsKey = key.split('.')[1]
      filterArray = filterArray.filter(elem => {
        if (Array.isArray(elem[paramsKey]))
          return elem[paramsKey].join(',') === filterParams[`filter.${paramsKey}`]
        return elem[paramsKey].toLowerCase().includes(filterParams[`filter.${paramsKey}`].toLowerCase())
      })
    }
  }

  if (params.search) {
    return filterArray.filter(elem => {
      let include = false;
      for (let value in elem) {
        include = include ? include : elem[value].toString().includes(params.search)
      }

      return include;
    });
  }

  return filterArray;
}

function addIdOnElem(elem) {
  return {
    ...elem,
    id: uuidv4()
  }
}

function addElemOnArrayWithId(array, elem) {
  const elemWithId = {
    ...elem,
    id: uuidv4()
  }
  return [ ...array, elemWithId ]
}

function pushElem(array, elem, absolutePath) {
  const elemWithId = addIdOnElem(elem)
  const newArray = [ ...array, elemWithId ]
  fs.writeFileSync(absolutePath, JSON.stringify(newArray, null, 2), 'utf-8')
  return elemWithId
}

function pushElemToCMS(array, elem, userId, absolutePath) {
  const newElem = {
    userId,
    user_properties: elem
  }
  const newArray = [ ...array, newElem ]
  fs.writeFileSync(absolutePath, JSON.stringify(newArray, null, 2), 'utf-8')
  return newElem
}

function readFile(absolutePath) {
  return JSON.parse(fs.readFileSync(absolutePath, {encoding:'utf8', flag:'r'}))
}

const settings = async (endpointName) => {
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
  const settingsFilePath = './settings/data.json'
  const settings = readFile(settingsFilePath)
  const setting = settings.find(setting => setting.name === endpointName)
  await delay(setting.delay)
  return setting.isErrorRequest
}

const filteredAndPaginationSort = (data, params) => {
  const filterContent = filterSort(data, params)
  const content = paginationSort(filterContent, params);
  return {
    content,
    number: parseInt(params.page),
    numberOfElements: content.length,
    size: parseInt(params.size),
    totalElements: filterContent.length,
    totalPages: Number.isInteger(filterContent.length / params.size) ? filterContent.length / params.size : parseInt(filterContent.length / params.size) + 1
  }
}

module.exports = { delay, paginationSort, deleteById, deleteByIds, createElem, putElemById, putElemToCMSById, filterSort, addElemOnArrayWithId, pushElem, pushElemToCMS, readFile, settings, filteredAndPaginationSort, deleteByArchivIds }