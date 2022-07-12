/**
 * grpc返回的entity格式化
 */
export const $entityFormatGRPC = function (entity) {
  entity.componentObject = {};
  entity.components = entity.components || {};
  for (const componentName in entity.components) {
    entity.componentObject[componentName] = {};
    const attributes = entity.components[componentName].attributes;
    for (const attributeName in attributes) {
      entity.componentObject[componentName][attributeName] =
        attributes[attributeName].data;
    }
  }

  return entity;
};

export const $timestampToTime = function (timer) {
  let curDate = new Date(timer);
  let Y = curDate.getFullYear();
  let M =
    curDate.getMonth() + 1 < 10
      ? `0${curDate.getMonth() + 1}`
      : `${curDate.getMonth() + 1}`;
  let D =
    curDate.getDate() < 10 ? `0${curDate.getDate()}` : `${curDate.getDate()}`;
  let H =
    curDate.getHours() < 10
      ? `0${curDate.getHours()}`
      : `${curDate.getHours()}`;
  let Min =
    curDate.getMinutes() < 10
      ? `0${curDate.getMinutes()}`
      : `${curDate.getMinutes()}`;
  let S =
    curDate.getSeconds() < 10
      ? `0${curDate.getSeconds()}`
      : `${curDate.getSeconds()}`;

  return `${Y}-${M}-${D} ${H}:${Min}:${S}`;
};
