const { v4: uuidv4 } = require('uuid');

const shortcuts = [
  "Users overview",
  "User requests",
  "Upload area",
  "Research",
  "Archive portal",
  "Orders",
  "Repro orders",
  "Special permits",
  "Statistics",
  "Manual"
]

const menu = [
  "Users overview",
  "User requests",
  "Research",
  "Archive portal",
  "Shopping cart",
  "Watch list",
  "Orders",
  "Repro orders",
  "My orders",
  "My repro orders",
  "Special permits",
  "Upload overview",
  "Statistics",
  "Manual"
]

const findbookOverviewTableColumns = [
  "Bestand name",
  "Bestand signature",
  "Findbook name",
  "Findbook signature",
  "DIPS",
  "METS",
  "Locks",
  "Upload date",
  "Preview"
]

const defaultUserProperties = (user) => {
  let shortcutsValues = shortcuts.slice(0, 5)
  if (user.external === false) shortcutsValues = [
    "User requests",
    "Research",
    "Orders",
    "Repro orders",
    "Special permits"
  ]
  if (user.external === true) shortcutsValues = [
    "Research",
    "Orders",
    "Repro orders",
    "Special permits"
  ]

  let menuValues = menu.slice(0, 5)
  if (user.external === false) menuValues = [
    "Users overview",
    "User requests",
    "Research",
    "Archive portal",
    "Shopping cart",
    "Watch list",
    "Orders",
    "Repro orders",
    "My orders",
    "My repro orders",
    "Special permits",
    "Upload overview",
    "Statistics",
    "Manual"
  ]
  if (user.external === true) menuValues = [
    "New user request",
    "My user requests",
    "Research",
    "Archive portal",
    "Shopping cart",
    "Watch list",
    "My orders",
    "My repro orders",
    "Special permits",
    "Upload overview",
  ]
  ﻿
 return [
  {
    user: user.id,
    id: uuidv4(),
    category: "start_page",
    key: "shortcuts",
    type: "STRING",
    values: shortcutsValues
  },
  {
    user: user.id,
    id: uuidv4(),
    category: "start_page",
    key: "menu",
    type: "STRING",
    values: menuValues
  },
  {
    user: user.id,
    id: uuidv4(),
    category: "upload_overview_page",
    key: "findbook_overview_table.columns",
    type: "STRING",
    values: findbookOverviewTableColumns
  }
]
}

module.exports = { defaultUserProperties }