import axios from 'axios';

import Helper from '../Helper';
import Logr from '../tools/Logr';

const logr = new Logr('XHR');
const h = new Helper();

class XhrHandler {
  getCSRFToken(formId) {
    // This function require django rendered form in the template
    const possibleForms = ["#scene_create_form", "#strip_create_form", "#frame_create_form"];

    let $form = null;
    if (formId === undefined) {

      let grabbed;
      for (let i = 0; i < possibleForms.length; i++) {
        grabbed = document.querySelector(possibleForms[i]);
        if (grabbed != null) {
          $form = grabbed;
          break;
        }

      }

      if ($form == null) {
        console.error("Cannot find any form to grab CSRFToken!");
        return false;
      }

    } else {
      $form = document.querySelector(formId);
    }

    const formData = h.serializeForm($form);
    const csrfToken = formData ? (formData.hasOwnProperty("csrfmiddlewaretoken") ? formData.csrfmiddlewaretoken : null) : null;

    return csrfToken;
  }






  fetchChapter(chapterId) {
    return (
      axios({
        method: 'get',
        url: `/api/chapter/${chapterId}/`,
      }).then(response => {
        return response;
      }).catch(error => {
        logr.error(error);
      })
    );
  }








  createScene(chapterId, formData, csrfToken) {
    return this.makeXHR('post', formData, `/api/chapter/${chapterId}/scene/create/`, csrfToken);
  }

  updateScene(sceneId, formData, csrfToken) {

    // TODO: patch update for Scene does not exist yet. This is template
    //       copied from updateStrip

    return (
      axios({
        method: 'patch',
        url: `/api/scene/${sceneId}/update/`,
        data: formData,
        headers: { 'X-CSRFToken': csrfToken },
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          logr.error(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }

  updateSceneMovieURL(sceneId, newUrl, csrfToken) {
    const fd = new FormData();
    fd.append('movie_url', newUrl);

    return (
      axios({
        method: 'patch',
        url: `/api/scene/${sceneId}/update/`,
        data: fd,
        headers: { 'X-CSRFToken': csrfToken },
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          logr.error(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }

  addToScenePlayback(sceneId, newPlayback, csrfToken) {
    // Scene stores up to 3 playback information in case something goes wrong
    // with the newest playback data.

    const fd = new FormData();
    fd.append('playback', JSON.stringify(newPlayback));
    // TODO: validate playback

    // TODO: this appears to be near identical to updateSceneMovieURL.
    //       It's because both are PATCH request. Find a way to merge them.

    return (
      axios({
        method: 'patch',
        url: `/api/scene/${sceneId}/update/`,
        data: fd,
        headers: { 'X-CSRFToken': csrfToken },
      }).then(response => {
        return response;
      }).catch(error => {
        logr.error(error);
        // TODO: add better error message that is visible on frontend
      })
    )

  }

  convertToStoreURLs(urls, extArr) {
    // Takes in relative url, and finds storage link for it
    // Currently used in VideoFeeder in order to retrieve video information from a field
    // that is not actually a FileField!

    if (!urls || urls.length === 0) {
      logr.warn('Url not provided retrieve from storage.');
      return false;
    }
    if (!extArr || extArr.length === 0) {
      logr.warn('Extension to check for storage url is not provided');
      return false;
    }

    // chain request to get url
    const urlReqProms = [];
    urls.forEach(url => {
      const urlParts = url.split('.');
      logr.info(encodeURIComponent(url) );
      if (extArr.includes(urlParts[urlParts.length - 1])) { // make sure extension matches
        urlReqProms.push(
          axios({
            method: 'get',
            params: { rel_url: encodeURI(url) },
            url: '/flipbooks/s3/getURL/',
          }).then(response => {
            return response;
          })
        );
      }
    });

    // resolve all
    // DO I NEED SEMI COLON OR WILL IT BREAK IT AGAIN
    return Promise.all(urlReqProms)

  }

  fetchScene(sceneId) {
    return (
      axios({
        method: 'get',
        url: `/api/scene/${sceneId}/`,
      })
        .then(response => {
          logr.info('[Scene fetch successful]');
          // thisObj.setState({data: response.data});
          // this.firstLoad = false;
          return response;
        })
        .catch(error => {
          console.log(error);
        })
    )
  }

  fetchSceneList(chapterId) {
    return (
      axios({
        method: 'get',
        url: `/api/chapter/${chapterId}/scene/all/`,
      }).then(res => {
        logr.info('Scene list fetch successful');
        return res;
      }).catch(error => {
        logr.error(error);
      })
    )
  }





  createStrip(sceneId, formData, csrfToken) {

    if (csrfToken === undefined) {
      csrfToken = this.getCSRFToken();
    }

    return (
      axios({
        method: 'post',
        url: `/api/scene/${sceneId}/strip/create/`,
        data: formData,
        headers: { "X-CSRFToken": csrfToken }
      })
        .then(response => {
          console.log("[New Strip created]");
          //thisObj.setState({data: response.data});
          //this.firstLoad = false;
          return response;
        })
        .catch(error => {
          console.log(error);
        })
    )
  }

  updateStrip(stripId, formData, csrfToken) {
    return (
      axios({
        method: 'patch',
        url: `/api/strip/${stripId}/update/`,
        data: formData,
        headers: { 'X-CSRFToken': csrfToken },
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          console.log(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }





  createFrame(stripId, formData, csrfToken) {
    return this.makeXHR('post', formData, `/api/strip/${stripId}/frame/create/`, csrfToken)
  }

  editFrame(frameId, formData, csrfToken) {
    return (
      axios({
        method: 'patch',
        url: `/api/frame/${frameId}/update/`,
        data: formData,
        headers: { "X-CSRFToken": csrfToken }
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          console.log(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }

  destoryFrame(frameId, csrfToken) {
    console.log("[Internal] CSRF token grabbed for FrameDelete: " + this.getCSRFToken());

    return (
      axios({
        method: 'delete',
        url: `/api/frame/${frameId}/`,
        headers: { "X-CSRFToken": csrfToken }
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          console.log(error);
          // TODO: add better error message that is visible on frontend
        })
    )
  }

  destroyStrip(stripId, csrfToken) {
    return this.makeXHR('delete', null, `/api/strip/${stripId}/`, csrfToken);
  }






  makeLambdaPie(sceneId, orderedFrameList) {
    const param = 'sceneid';
    const endpoint = `https://53e5kyqgq7.execute-api.us-east-2.amazonaws.com/production/framePie?${param}=${sceneId}`;
    // const endpoint = `https://0u5szwsc6b.execute-api.us-east-2.amazonaws.com/default/framePie?${param}=${sceneId}`;

    // Hard coded request for testing purpose
    const reqBody = {
      "shape": [
        1500,
        800
      ],
      "frame_file_names": [
        "s70/st192-0__444021504f/st192-0__444021504f.png",
        "s70/st192-1__7cf36b2776/st192-1__7cf36b2776.png",
        "s70/st193-1__735cb5a64d/st193-1__735cb5a64d.png",
        "s70/st193-2__3507c65258/st193-2__3507c65258.png",
        "s70/st193-3__fb3ac9c12f/st193-3__fb3ac9c12f.png",
        "s70/st193-0__46c3171f63/st193-0__46c3171f63.png",
        "s70/st199-0__fa2a90464c/st199-0__fa2a90464c.png",
        "s70/st199-1__3ae68a2f0c/st199-1__3ae68a2f0c.png",
        "s70/st208-0__16634ba6bf/st208-0__16634ba6bf.png",
        "s70/st208-1__6b60a7a6b0/st208-1__6b60a7a6b0.png",
        "s70/st208-2__d2c55d6ba9/st208-2__d2c55d6ba9.png",
        "s70/st208-3__bb89b64a04/st208-3__bb89b64a04.png",
        "s70/st209-0__10b8a60527/st209-0__10b8a60527.png",
        "s70/st209-1__df9954406b/st209-1__df9954406b.png",
        "s70/st209-2__2cd058a384/st209-2__2cd058a384.png",
        "s70/st209-3__7149693794/st209-3__7149693794.png",
        "s70/st210-0__ffd386d2a7/st210-0__ffd386d2a7.png",
        "s70/st210-1__d9a8838b36/st210-1__d9a8838b36.png",
        "s70/st210-2__acf1c63eb2/st210-2__acf1c63eb2.png",
        "s70/st210-3__e507609b50/st210-3__e507609b50.png",
        "s70/st210-4__2e209fd7be/st210-4__2e209fd7be.png"
      ]
    };

    // Formdata successfully sends but....I can't parse it from Python side.
    const fd = new FormData();
    fd.append('mytest', 1234);

    return (
      axios({
        method: 'post',
        url: endpoint,
        data: { 'data': 123456678 },
        headers: {
          'Content-Type': 'application/json',
          //'Content-Type': 'x-www-form-urlencoded'
          //'Content-Type': 'multipart/form-data',
        },
      }).then(response => {
        console.log(response);
        return response;
      }).catch(error => {
        logr.error(error);
        logr.error("didn't make it!");
        // TODO: add better error message that is visible on frontend
      })
    )

    // return window.fetch(endpoint, {
    //   method: "POST", // *GET, POST, PUT, DELETE, etc.
    //   mode: "cors", // no-cors, cors, *same-origin
    //   headers: {
    //     "Content-Type": "application/json",
    //     // "Content-Type": "application/x-www-form-urlencoded",
    //   },
    //   body: JSON.stringify(reqBody), // body data type must match "Content-Type" header
    // }).then(response => response.json()); // parses response to JSON




  }

  
  


  // Trying this out
  django_getSceneUrl(name, data) {
    // django seem to really hate it when there is ":" in the url...

    let parsedName = name.split(":");
    parsedName = parsedName.join("--colon--");
    return this.makeXHR('get', null, `/flipbooks/rh/get_url_by_name/${parsedName}/${data.pk}/`, null);
  }




  // Attempt at generic
  makeXHR(method, data, endpoint, csrfToken, hder) {

    // TODO: investigate why using this.getCSRFToken gets 403 error
    // if (csrfToken === undefined) {const csrfToken = this.getCSRFToken();}

    hder = hder ? {} : { 'X-CSRFToken': csrfToken };

    return (
      axios({
        method: method,
        url: endpoint,
        data: data,
        headers: hder
      })
        .then(response => {
          return response;
        })
        .catch(error => {
          console.log(error);
          // TODO: add better error message that is visible on frontend

        })
    )
  }

  // For recursion!
  getPromise(method, data, endpoint, csrfToken) {

    // TODO: investigate why using this.getCSRFToken gets 403 error
    // if (csrfToken === undefined) {const csrfToken = this.getCSRFToken();}

    return (
      axios({
        method: method,
        url: endpoint,
        data: data,
        headers: { 'X-CSRFToken': csrfToken }
      })
    )

  }

}


export default XhrHandler;