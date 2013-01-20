
var load = function(bpmn2File) { 
  if(window.XMLHttpRequest)  {
    // code for IE7+, Firefox, Chrome, Opera, Safari
    xmlhttp = new XMLHttpRequest();
  } else {
    // code for IE6, IE5
    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
  }
  
  xmlhttp.open("GET", bpmn2File, false);
  xmlhttp.send();
  bkmkTxt = xmlhttp.responseText;

  if( xmlhttp.status != 200 ) { 
    throw new Error( "Unable to GET '" + bpmn2File + "': " + xmlhttp.statusText );
  }
  
  return bkmkTxt;
}

var dataFile = "bookmarks-chrome.html";
var bookmarkData = load(dataFile);
var root = bmv.parser.generateTree(bookmarkData);

/**
 * test functions
 */

var testParent = function( node, parent ) { 
  ok( node.parent && node.parent != null, node.name + " has a parent." );
  ok( node.parent === parent, node.name + "'s parent is " + parent.name )
}

var testChildren = function( node, nc ) { 
  ok( node.children && node.children.length == nc, node.name + " has " + nc + " children [" + node.children.length + "]" );
}

/**
 * tests
 */
test("load test", function() {
  ok( bookmarkData != null, "Retrieved text is not null" );
  var x = 100;
  ok( bookmarkData.length > x, "Retrieved text is longer than " + x + " characters" );
});


test("basic tree test", function() {
  ok( root != null, "Root node is not null" );
  var x = "bookmarks";
  ok( root.name != null && root.name == x, "Root has a name that is " + x );

  ok( root.children != null, "Root has children" );
  x = 10;
  ok( root.children.length >= x, "Root has at least " + x + " children" );
  for( var c = 0; c < 10; ++c ) { 
    var child = root.children[c];
    testParent( child, root );
  }
});

test("basic folder depth and structure test", function() {
  var d = 0;
  var child = root.children[1];
  testChildren( child, 3 );
  ok( child._text.length > 1, child.name + " contains _text" );
  testParent( child, root );
  
  var gChild = child.children[0]; 
  testChildren( gChild, 7 );
  ok( gChild._text.length > 1, child.name + " contains _text" );
  testParent( gChild, child );
  
  var ggChild = gChild.children[0]; 
  testChildren( ggChild, 5 );
  ok( ggChild._text.length > 1, child.name + " contains _text" );
  testParent( ggChild, gChild );
  
  for( var c = 0; c < ggChild.children.length; ++c ) { 
    ok( ggChild.children[c].name && ggChild.children[c].name.length > 1, ggChild.name + " has a name." );
    ok( ggChild.children[c].children == null, ggChild.name + " does not have any children." );
  }
});


test("link content test", function() {
  var child = root.children[1];
  var parent = null;
  while( child.children != null ) { 
    parent = child;
    child = child.children[0];
  };

  var httpRE = new RegExp("http://");
  
  var testLinkContent = function(folder) { 
    for( var c = 0; c < folder.children.length; ++c ) { 
      if( httpRE.test(child._text) ) {
        var text = child._text;
        text = text.replace(/\s*\n*\s*$/m, "");
        ok( child.link && child.link != null, "child of " + parent.name + " does not have a filled link.\n  [" + text + "]" );
      }
    }
  };
  
  testLinkContent(parent);
  
});