function mOve(uRl) {
    function isMobile() {
      var userAgent = navigator.userAgent;
      var mobile = /(iPhone|iPad|Android|BlackBerry|Windows Phone)/i.test(userAgent);
      return mobile;
    }

    if (isMobile()) {
        window.location.href=`https://docs.google.com/viewerng/viewer?url=${uRl}`;
    } else {
       	window.location.href=`${uRl}`;
    }
}


function Goo(URl) {
    window.location.href=`${URl}`;
}

function dowN(url) {
    const a = document.createElement('a');
    a.href = url;

    // URL에서 파일명 추출 (마지막 '/' 이후 문자열)
    const filename = url.split('/').pop().split('?')[0]; // 쿼리스트링 제거

    a.download = filename; // 파일명 지정
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
