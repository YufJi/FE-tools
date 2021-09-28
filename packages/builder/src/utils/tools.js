import axios from 'axios';

function request({ url, params, method, isSpider = false }) {
  return axios({
    method: method || 'get',
    url,
    data: params,
    params,
    transformResponse: [function (data) {
      // console.log(data)
      return isSpider ? data : JSON.parse(data);
    }],
  });
}

export {
  request,
};
