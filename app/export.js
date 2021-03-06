var Firebase = require('firebase'),
    Q = require('q'),
    debug = require('./debug');

var treecfg = {
  mindepth: 8,
  targets_at: 1,
  targets: {},
  labels: ['Date', 'Domain', 'Country', 'X', 'City', 'ISP', 'Hits', 'FailRate']
};

// Retrieve a snapshot of current statistics from Firebase
function getSnapshot() {
  return Q.Promise(function(resolve, reject) {
    debug("Retrieving snapshot", process.env.FBIO_STATS_URL);
    var ref = new Firebase(process.env.FBIO_STATS_URL);
    ref.once('value', resolve, reject);
  });
}

// Prints out given branch
function printBranch(nodes) {
  if (nodes.length >= treecfg.mindepth) {
    // node is at the required depth - this is the data we're interested in,
    // print the branch
    console.log(nodes.join(','));
  }
}

// Calculate the failure rate at the given node
function calcRate(node) {
  var fail = (node.fail || 0)*1,
      succ = (node.succ || 0)*1;
  if (fail + succ == 0) { succ = 1; }
  node[(fail + succ) + ''] = Math.round(fail / (succ + fail) * 100.0) / 100.0;
  delete node.fail;
  delete node.succ;
  return node;
}

// Recursively export tree under the given root, optionally filtering nodes
// according to the given function
function exportTree(root, tree, parents) {
  var filter;
  if (!parents) { parents = []; }

  if (!tree || typeof(tree) != 'object') {
    // reached a leaf - print the whole branch
    printBranch(parents.concat([root, tree]));
    return;
  }
  // Calculate failure rate, of either succ or fail counter is present at
  // this node
  if (tree.succ || tree.fail) { calcRate(tree); }
  // Reset parents history at the given tree depth
  if (parents.length == treecfg.targets_at) { root = treecfg.targets[root] || root; }

  Object.keys(tree).map(function(node) {
    exportTree(node, tree[node], parents.concat([root]))
  });
  return true;
}

// Export received snapshot as csv data
function exportData(snap) {
  var data = snap.val();
  console.log(treecfg.labels.join(','));

  var treex = function(key) { return exportTree(key, data[key]); }
  return Q.Promise(function(resolve) {
    Object.keys(data).map(treex);
    resolve(true);
  });
}

function populateNameMap() {
  var names = process.env.TARGET_NAMES.split(',');
  names.forEach(function(name, i) {
    if (i % 2 === 1) { return; }
    treecfg.targets[name] = names[i + 1];
  });
}

function csv() {
  populateNameMap();
  return getSnapshot().then(exportData);
}

module.exports = {
  csv: csv
}
