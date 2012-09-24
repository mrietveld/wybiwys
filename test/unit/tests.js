test("hello test", function() {
  // debugger
  ok(1 != "1", "Passed!");
});

test("retrieve test", function() {
  xmlhttp = new XMLHttpRequest();
  var url = "http://localhost:8080/data/bookmarks.html";
  xmlhttp.open("GET", url, false);
  xmlhttp.send();
  xmlDoc = xmlhttp.responseXML;
  ok(xmlDoc.length > 0);
});
