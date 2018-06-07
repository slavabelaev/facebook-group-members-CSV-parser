console.clear();

var groupMemberElement = document.querySelector('#groupsMemberBrowserContent'),
  groupMembers = [];

var backDropContainer = document.createElement('div');
var downloadButton = document.createElement('button');
var countParsedMembersElement = document.createElement('span');

function getGroupMembers(searchableElement) {
    var groupMemberElements = searchableElement.querySelectorAll('[data-name="GroupProfileGridItem"]>a>img');
    groupMemberElements.forEach(function(item, index) {
        var linkElement = item.parentNode,
          dataHovercardAttr = linkElement.getAttribute('data-hovercard'),
          memberId = dataHovercardAttr.match(/(?!\?id=)[0-9]*?(?=&)/)[0],
          name = item.getAttribute('aria-label'),
          facebookURL = linkElement.getAttribute('href'),
          fbUsername = facebookURL.match(/(?!.*?\/).*?(?=\?)/)[0];
        
        fbUsername = (fbUsername == 'profile.php') ? '' : fbUsername;

        var currentUserData = { "memberId": memberId, "name": name, "fbUsername": fbUsername, "facebookURL": facebookURL };
        //console.log(memberId, fbUsername, name, facebookURL);

        groupMembers.push(currentUserData);
    });

  countParsedMembersElement.innerHTML = groupMembers.length;
}

function removePrevivousSibling(element) {
  var previous = element.previousSibling;

  while(previous && previous.nodeType !== 1) {
      previous = previous.previousSibling;
  }

  if(previous) {
      previous.parentNode.removeChild(previous);
  }
}

function scrollPageToDown() {
    window.scrollTo(0,document.body.scrollHeight);
}

var observeDOM = (function() {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver,
        eventListenerSupported = window.addEventListener;

    return function(obj, callback) {
        if (MutationObserver) {
            // define a new observer
            var obs = new MutationObserver(function(mutations, observer) {
                if (mutations[0].addedNodes.length || mutations[0].removedNodes.length)
                    callback();
            });
            // have the observer observe foo for changes in children
            obs.observe(obj, { childList: true, subtree: true });
        } else if (eventListenerSupported) {
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    };
})();

var changableElement = document.querySelector('#groupsMemberSection_recently_joined');
observeDOM(changableElement, function() {
    var loadedGroupMemberElement = changableElement.querySelector('.fbProfileBrowserList.expandedList:last-child');

    getGroupMembers(loadedGroupMemberElement);
    removePrevivousSibling(loadedGroupMemberElement);
    scrollPageToDown();
});

function createInterface() {
  backDropContainer.style.backgroundColor = 'rgba(0,0,0,.8)';
  backDropContainer.style.position = 'fixed';
  backDropContainer.style.top = '0px';
  backDropContainer.style.bottom = '0px';
  backDropContainer.style.left = '0px';
  backDropContainer.style.right = '0px';
  backDropContainer.style.zIndex = '9999';
  backDropContainer.style.backgroundImage = 'url(https://static.xx.fbcdn.net/rsrc.php/v3/ym/r/ApyI70_PuhE.gif)';
  backDropContainer.style.backgroundPosition = 'center';
  backDropContainer.style.backgroundRepeat = 'no-repeat';
  backDropContainer.style.backgroundSize = '50px';
  document.body.append(backDropContainer);
  
  downloadButton.innerHTML = 'Download parsed members: ';
  downloadButton.append(countParsedMembersElement);
  downloadButton.style.position = 'fixed';
  downloadButton.style.margin = 'auto';
  downloadButton.style.fontSize = '20px';
  downloadButton.style.width = '500px';
  downloadButton.style.height = '50px';
  downloadButton.style.top = '0px';
  downloadButton.style.bottom = '0px';
  downloadButton.style.left = '0px';
  downloadButton.style.right = '0px';
  downloadButton.style.zIndex = '9999';
  document.body.append(downloadButton);
  downloadButton.onclick = function() {
      var data = convertArrayOfObjectsToCSV({ data: groupMembers });
      downloadFile(data, 'facebook-parser' + new Date().getTime() + '.csv', 'data:text/csv;charset=utf-8');
  }
}

function convertArrayOfObjectsToCSV(args) {
    var result, ctr, keys, columnDelimiter, lineDelimiter, data;

    data = args.data || null;
    if (data == null || !data.length) {
        return null;
    }

    columnDelimiter = args.columnDelimiter || ',';
    lineDelimiter = args.lineDelimiter || '\n';

    keys = Object.keys(data[0]);

    result = '';
    result += keys.join(columnDelimiter);
    result += lineDelimiter;

    data.forEach(function(item) {
        ctr = 0;
        keys.forEach(function(key) {
            if (ctr > 0) result += columnDelimiter;

            result += item[key];
            ctr++;
        });
        result += lineDelimiter;
    });

    return result;
}

function downloadFile(data, filename, type) {
    var file = new Blob([data], {type: type});
    if (window.navigator.msSaveOrOpenBlob) // IE10+
        window.navigator.msSaveOrOpenBlob(file, filename);
    else {
        var a = document.createElement("a"),
                url = URL.createObjectURL(file);
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        setTimeout(function() {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);  
        }, 0); 
    }
}

getGroupMembers(groupMemberElement);
scrollPageToDown();
createInterface();

setInterval(function() {
  scrollPageToDown();
}, 1000);