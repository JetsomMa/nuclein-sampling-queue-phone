<template>
  <div id="app" class="page">
    <h1 class="page-title"><span>海淀街道</span>核酸采样点排队情况</h1>

    <section class="page-content">
      <div class="update-time">
        <span>{{ timeDifference }}秒前更新</span>
        更新时间：{{ updateTime }}
      </div>

      <ul class="table-list">
        <li class="item" v-for="(item, index) in tableList" :key="item.address">
          <div class="number">
            {{ index + 1 }}
          </div>
          <section class="point-info">
            <div class="wait-time">
              <span style="margin-right: 0.5rem">{{
                item.institutionName
              }}</span>
              <span>预估排队时间: {{ item.expectedQueue }}</span>
            </div>
            <div class="address">{{ item.address }}</div>
            <div class="work-time">
              采样时间：上午{{ item.workTime[0] }} 下午{{ item.workTime[1] }}
            </div>
          </section>
        </li>
      </ul>

      <div class="page-tip">采样速度：大约150人/小时/窗口</div>
    </section>

    <section class="qr-code">
      <div class="tip">长按保存二维码，随时查看排队信息</div>
      <div class="img">
        <img
          id="img"
          src="../public/assets/qrCode.png"
          @touchstart="touchstart()"
          @touchmove="touchmove()"
          @touchend="touchend()"
        />
      </div>
    </section>

    <section class="company-name">北京奇岱松科技有限公司</section>
  </div>
</template>

<script>
import axios from "axios";
import { $entityFormatGRPC, $timestampToTime } from "./common/utils";
export default {
  name: "App",
  components: {},
  data() {
    return {
      tableList: [],
      updateTime: "",
      timeDifference: 0,
      pollingTimeDifference: null,
      pollingGetDataList: null,
    };
  },
  mounted() {
    this.getDataList();
    this.pollingTimeDifference = setInterval(this.getTimeDifference, 1000);
    this.pollingGetDataList = setTimeout(this.getDataList, 60 * 1000);
  },
  unmounted() {
    clearInterval(this.pollingTimeDifference);
    clearInterval(this.pollingGetDataList);
  },
  destroyed() {
    clearInterval(this.pollingTimeDifference);
    clearInterval(this.pollingGetDataList);
  },
  watch: {
    tableList(newValue) {
      if (newValue) {
        this.updateTime = $timestampToTime(new Date().getTime());
        this.getTimeDifference();
      }
    },
  },

  methods: {
    getDataList() {
      axios
        .get(
          `${process.env.VUE_APP_OASIS}/som/search/entities?entityFilter=2&enclosureId=1TjZK6lSPqhrkENzm02TB&class=covidCheckpoint&getComponents=covidCheckpointInfo`
        )
        .then((resp) => {
          // 处理成功情况
          if (resp.status == 200) {
            let gatheringCrowdNum = 0;
            const tableList =
              resp.data?.entities?.length &&
              resp.data?.entities
                .map((item) => {
                  // gatheredNumber = waitUser * 2.05 * 0.25 / way
                  const result =
                    $entityFormatGRPC(item).componentObject[
                      "covidCheckpointInfo"
                    ];
                  const gatheredNumber =
                    Math.ceil(Number(result?.waitUser * 2.05)) || 0;

                  // status: 0为正常 1为异常
                  if (result?.status == "0") {
                    gatheringCrowdNum += gatheredNumber;
                  }

                  return {
                    ...result,
                    institutionName: result?.name || "",
                    gatheredNumber:
                      result?.status == "0" ? gatheredNumber + "人" : "暂无",
                    expectedQueue:
                      result?.status == "0"
                        ? result?.waitUser
                          ? `${Math.ceil(
                              (gatheredNumber * 0.25) / Number(result?.way)
                            )}分钟`
                          : "0分钟"
                        : "暂无",
                    waitTime: result?.waitTime || 0,
                    address: result?.address || "暂无",
                    workTime: result?.workTime.replace(/\s+/g, "").split(";"),
                    status: result?.status,
                    gatheringCrowdNum,
                  };
                })
                .sort((a, b) => {
                  return a.institutionName.localeCompare(b.institutionName);
                })
                .sort((a, b) => {
                  return a?.status - b?.status;
                })
                .sort((a, b) => {
                  return a?.gatheredNumber - b?.gatheredNumber;
                });
            this.tableList = tableList;
          }
        })
        .catch((error) => {
          // 处理错误情况
          console.error(error);
        });
    },

    getTimeDifference() {
      let lastUpdateTime = new Date(this.updateTime).getTime();
      let newDate = new Date().getTime();
      this.timeDifference = Number((newDate - lastUpdateTime) / 1000).toFixed(
        0
      );
    },

    //长按事件（起始）
    touchstart(item) {
      var self = this;
      this.timeOutEvent = setTimeout(function () {
        self.longPress(item);
      }, 500);
      return false;
    },
    touchend() {
      clearTimeout(this.timeOutEvent);
    },
    touchmove() {
      clearTimeout(this.timeOutEvent);
      this.timeOutEvent = 0;
    },
    longPress() {
      this.timeOutEvent = 0;
      console.log("长按");
      var img = document.getElementById("img");
      var url = img.src;
      this.savePic(url);
      // var a = document.createElement("a");
      // var event = new MouseEvent("click");
      // a.download = "imgName";
      // a.href = url;
      // a.dispatchEvent(event);
    },

    savePic(Url) {
      var blob = new Blob([""], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = Url;
      a.download = Url.replace(/(.*\/)*([^.]+.*)/gi, "$2").split("?")[0];
      var e = document.createEvent("MouseEvents");
      e.initMouseEvent(
        "click",
        true,
        false,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );
      a.dispatchEvent(e);
      URL.revokeObjectURL(url);
    },
  },
};
</script>

<style>
.page {
  width: 100vw;
  height: 100%;
  background: url("../public/assets/background.png") no-repeat;
  background-size: cover;
  background-position: center center;
  font-family: "PingFang SC";
}
.page .page-title {
  text-align: center;
  padding: 6rem 0 0.5rem 0;
  font-size: 2.8rem;
  font-style: normal;
  font-weight: 600;
  color: #fff;
}
.page .page-title span {
  display: block;
  line-height: 6rem;
  font-size: 6.4rem;
}

.page .page-content {
  /* height: 50rem; */
  margin: 2rem 1.3rem 0;
  border-radius: 10px;
  background: #fff;
}

.page .page-content .update-time {
  position: realtive;
  text-align: center;
  border-radius: 10px;
  padding: 2.4rem 0;
  font-size: 1.8rem;
  font-weight: 600;
  color: #fff;
  background: #2eeca1;
  box-shadow: 0px 2px 15px #26d38f;
}
.page .page-content .update-time span {
  position: absolute;
  right: 1rem;
  top: 0.5rem;
  font-size: 1.2rem;
  font-style: normal;
  font-weight: 400;
}

ul,
li {
  list-style: none;
}

.page .page-content .table-list {
  height: 40rem;
  overflow: auto;
  margin-top: 2rem;
}

.page .page-content .table-list .item {
  width: 100%;
  display: flex;
  border-bottom: 0.5px dashed #e0e0e0;
  padding: 1rem 0 0.5rem 0;
}

.page .page-content .table-list .number {
  width: 5rem;
  line-height: 7rem;
  text-align: center;
  font-family: "DIN Alternate";
  font-style: normal;
  font-weight: 700;
  font-size: 3rem;
}

.page .page-content .table-list .point-info {
  flex: 1;
  padding-right: 1rem;
}

.page .page-content .table-list .wait-time {
  display: flex;
  justify-content: space-between;
  font-style: normal;
  font-weight: 500;
  font-size: 1.3rem;
  line-height: 2rem;
}

.page .page-content .table-list .address {
  color: rgba(0, 0, 0, 0.45);
  line-height: 2rem;
}

.page .page-content .table-list .work-time {
  color: rgba(0, 0, 0, 0.25);
  line-height: 3rem;
}

.page .page-content .page-tip {
  color: rgba(0, 0, 0, 0.2);
  text-align: center;
  padding: 1rem 0;
  font-weight: 400;
  font-size: 1.4rem;
}

.page .qr-code {
  width: 100%;
}

.page .qr-code .tip {
  text-align: center;
  padding: 2rem 0 1rem;
  color: #fff;
}

.page .qr-code .img {
  margin: 0 auto;
  width: 12rem;
  height: 12rem;
  background: #ffbf27;
  position: relative;
}

.page .qr-code .img img {
  display: block;
  position: absolute;
  left: 50%;
  top: 50%;
  width: 85%;
  height: 85%;
  transform: translate(-50%, -50%);
  margin: 0;
}

.page .company-name {
  width: 100%;
  padding: 2rem 0;
  text-align: center;
  color: #fff;
}

@media only screen and (max-width: 360px) {
  .page .page-content .table-list .number {
    width: 4rem;
    line-height: 8rem;
  }

  .page .page-content .table-list .wait-time {
    flex-direction: column;
  }
}

/* @media only screen and (min-width: 375px) {
  .page .page-content .table-list .number {
    width: 5rem;
    line-height: 8rem;
  }
} */
</style>
