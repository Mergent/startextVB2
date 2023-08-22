const findUnitById = (data, id) => {
  let tree = []
  const findInTree = (treeChildren)  => {
    for (let child of treeChildren) {
      if (child.id === id) {
         tree = child
      }
      if (child.children) {
        findInTree(child.children)
      }
    }
  }
  findInTree(data)
  return tree
}

function recursiveSearch(arr, id, ch) {
  arr.map(item => {
    if (item.id === id) {
      item.children = ch;
    } else {
      recursiveSearch(item.children, id, ch);
    }
  })
}

const parseTree = (treeArchives) => treeArchives.map(unit => ({
  id: unit.id,
  state: unit.state,
  title: unit.title.substr(0, 100),
  veraEntity: unit.veraEntity
}))

function searchInTreeByTitle(tree, title, isPushObject) {
  const titleArray = []
  function recursiveSearchByTitle(arr) {
    arr.map(item => {
      if (title === "") {
        titleArray.push(item)
      } else if (item.title.toLowerCase().includes(title.toLowerCase())) {
        if (isPushObject) {
          titleArray.push(item)
        } else {
          titleArray.push(item.title.toLowerCase().split(' ').find(word => word.includes(title.toLowerCase())))
        }
      }
      if (item.children) recursiveSearchByTitle(item.children);
    })
  }
  recursiveSearchByTitle(tree)
  return titleArray
}

function findAllArchives(tree) {
  const archives = []
  function recursiveSearch(arr) {
    arr.map(item => {
      if (item.type.value === "ARCHIV") {
        archives.push({
          documentKey: item.id,
          name: item.title,
          divisionId: item.divisionId
        })
      }
      if (item.children) recursiveSearch(item.children);
    })
  }
  recursiveSearch(tree)
  return archives
}

function findAllFindbuches(tree, archiveId) {
  const archive = tree.find(archive => archive.id === archiveId).children ?? []
  const findbuches = []
  function recursiveSearch(arr) {
    arr.map(item => {
      if (item.type.value === "FINDBUCH") {
        findbuches.push({
          documentKey: item.id,
          name: item.title
        })
      }
      if (item.children) recursiveSearch(item.children);
    })
  }
  recursiveSearch(archive)
  return findbuches
}

const parseDocumentsToResponse = (documents) => {
  return documents.map(document => ({
    veraEntity: document.type.value,
    archivDocumentTitle: document.corpName,
    title: document.invisible ? null : document.title,
    laufzeit: document.unitDate ?? null,
    inhalt: document.scopeContent ?? null,
    compoundSign: document.signatur ?? null,
    dockey: document.id,
    invisible: document.invisible ?? false,
    unorderable: document.unorderable ?? false,
    urlViewer: document.smallLink ?? null,
    hasDips: document.hasDips ?? true,
    hasMets: document.hasMets ?? true,
    hasLockChildren: document.hasLockChildren ?? false,
  }))
}

const parseTreeToResponse = (tree) => {
  return tree.map(unit => ({
    title: unit.invisible ? "The title can not be displayed for legal reasons" : unit.title,
    count: unit.count,
    dockey: unit.id,
    sign: unit.signatur ?? null,
    type: unit.type.value
  }))
}

const searchByTitleRecursivly = (arr, params) => {
  let treeIds = []

  const findKeywordInTree = (treeChildren, ids) => {
    for (let child of treeChildren) {
      if (child.children) {
        ids.push(child.id)
        findKeywordInTree(child.children, ids)
      }
      if (child.title.toLowerCase().includes(params.keyword.toLowerCase())
      || child.scopeContent?.toLowerCase().includes(params.keyword.toLowerCase())
      || child.laufzeit?.toLowerCase().includes(params.keyword.toLowerCase())
      || child.signatur?.toLowerCase().includes(params.keyword.toLowerCase())
      || child.corpName?.toLowerCase().includes(params.keyword.toLowerCase())
    ) {
        ids.push(child.id)
        treeIds = treeIds.concat(ids.filter((item) => !treeIds.includes(item)));
      }
      ids = ids.filter(x => x !== child.id)
    }
  }

  findKeywordInTree(arr, [])

  return arr.filter(function f(o) {
    if (o.children && treeIds.includes(o.id)) {
      return o.children = o.children.filter(f)
    }

    if (treeIds.includes(o.id)) return true
  })
}

const searchByIdWithSiblingsRecursivly = (arr, nodeid) => {
  let treeIds = []

  const findKeywordInTree = (treeChildren, ids) => {
    ids = ids.concat(treeChildren.map(child => child.id))
    for (let child of treeChildren) {
      if (child.children) {
        findKeywordInTree(child.children, ids)
      }
      if (parseInt(child.id) === parseInt(nodeid)) {
        treeIds = ids
      }
    }
  }

  findKeywordInTree(arr, [])

  return arr.filter(function f(o) {
    if (o.children && treeIds.includes(o.id)) {
      return o.children = o.children.filter(f)
    }

    if (treeIds.includes(o.id)) return true
  })
}

const searchByFindbuchRecursivly = (arr, params) => {
  let treeIds = []

  const findKeywordInTree = (treeChildren, ids) => {
    for (let child of treeChildren) {
      if (child.children) {
        ids.push(child.id)
        findKeywordInTree(child.children, ids)
      }
      if (child.id === params.selectedFindbuchDocumentKey) {
        ids.push(child.id)
        treeIds = treeIds.concat(ids.filter((item) => !treeIds.includes(item)));
      }
      ids = ids.filter(x => x !== child.id)
    }
  }

  findKeywordInTree(arr, [])

  return arr.filter(function f(o) {
    if (o.children && treeIds.includes(o.id)) {
      return o.children = o.children.filter(f)
    }

    if (treeIds.includes(o.id)) return true
  })
}

const countAllChildren = (tree) => {
  const countChildren = (tree) => {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i].children) {
        countChildren(tree[i].children)
        tree[i].count = tree[i].children.reduce((partialSum, a) => {
          return partialSum + a.count
        }, 0) + 1;
      } else {
        tree[i].count = 1
      }
      if (i === tree.length -1) {
        return tree[i].count;
      }
    }
  }
  return countChildren(tree)
}

const parseTreeToResponseRecursivly = (tree) => {
  return tree?.map(unit => ({
    title: unit.invisible ? "The title can not be displayed for legal reasons" : unit.title,
    count: unit.count,
    dockey: unit.id,
    sign: unit.signatur ?? null,
    type: unit.type.value,
    children: parseTreeToResponseRecursivly(unit.children)
  }))
}

module.exports = { findUnitById, parseTree, recursiveSearch, searchInTreeByTitle, findAllArchives, findAllFindbuches, parseDocumentsToResponse, parseTreeToResponse, parseTreeToResponseRecursivly, searchByTitleRecursivly, searchByIdWithSiblingsRecursivly, countAllChildren, searchByFindbuchRecursivly }