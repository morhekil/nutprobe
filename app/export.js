var Firebase = require('firebase'),
    Q = require('q'),
    debug = require('./debug');

var tree = {
  mindepth: 8
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
  // console.log(nodes.length, tree.mindepth);
  if (nodes.length >= tree.mindepth) {
    console.log(nodes.join(','));
  }
}

// Calculate the failure rate at the given node
function calcRate(node) {
  var fail = (node.fail || 0)*1,
      succ = (node.succ || 0)*1;
  if (fail + succ == 0) { succ = 1; }
  node.failRate = Math.round(fail / (succ + fail) * 100.0) / 100.0;
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
    // reached a leaf
    printBranch(parents.concat([root, tree]));
    return;
  }
  if (tree.succ || tree.fail) { calcRate(tree); }

  Object.keys(tree).map(function(node) {
    exportTree(node, tree[node], parents.concat([root]))
  });
  return true;
}

// Export received snapshot as csv data
function exportData(snap) {
  var data = snap.val();
  var treex = function(key) { return exportTree(key, data[key]); }

  return Q.Promise(function(resolve) {
    var csv = Object.keys(data).map(treex).join("\n");
    resolve(csv);
  });
}

function csv() {
  return getSnapshot().then(exportData);
}

module.exports = {
  csv: csv
}
