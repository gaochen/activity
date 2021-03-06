$(function () {
  // 短信渠道
  // var source = getURLParams('source')
  // if (source === 'SMS') {
  //   $('.index').addClass('SMS')
  // }

  var browser = {
    versions: function () {
      var u = navigator.userAgent, app = navigator.appVersion;
      return {         //移动终端浏览器版本信息
        mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
      };
    }()
  }

  if (browser.versions.mobile) {
    $('.section-02').find('.btn').on('click', function() {
      window.location.href = 'https://www.anbangjr.com/lcb_webView/lcbproductinsurance/getDetailsInsurance_view?pcode=2140322&src=3&tel=&kuser=&channelTypeCode=5'
    })
  } else {
    $('.section-02').find('.btn').on('click', function() {
      window.location.href = 'http://www.ab95569.com/ConfigurationDetailsPage/indexIframe.do?prono=2140322&indexFlag=1'
    })
  }

  var href = window.location.href.match(/http.+\/website[^\/]*\//gi)
  const ip = href ? href[0] : 'https://jk.anbanggroup.com/websitedat/'
  // const ip = 'https://jk.anbanggroup.com/websiteyaoyao/'

  var userInfo = storage.get('userInfo')
  var shareInfo = storage.get('shareInfo', true)

  // 是否已经分享该活动
  if (userInfo && shareInfo) {
    var num = new Date().getTime() - shareInfo.time
    if (num < 43200000 && userInfo.openId === shareInfo.openId) {
      // $('.checkShare').addClass('checkActive')
      $('.part-02').find('.btn').addClass('checkActive')
    }
  }

  if (userInfo) {
    // 是否已经关注公众号
    if (userInfo.subscribe === 1) {
      $('.checkFollow').addClass('checkActive')
    }

    // 是否已经免费领取
    if (userInfo.obtain === 1) {
      $('.part-01').find('.btn').hide().siblings('.disable').show()
    }
  } else {
    userInfo = {
      openId: null,
      subscribe: 0, // 公众号关注状态
      obtain: 0 // 是否已免费领取交通意外险
    }
  }

  // 是否为微信浏览器
  if (
    navigator.userAgent.toLowerCase().match(/MicroMessenger/i) ==
    'micromessenger'
  ) {
    var code = getURLParams('code')
    if (!code) {
      return false
    }
    if (!userInfo.openId) {
      $.ajax({
        type: 'GET',
        url: ip + 'mweb/user/activity/getSubscribeInfo?',
        data: { 'code': code },
        contentType: "application/json",
        success: function (res) {
          if (res.operateStr === 'success') {

            userInfo = {
              openId: res.outputObj.openId,
              subscribe: res.outputObj.subscribe,
              obtain: res.outputObj.obtain
            }
            storage.set('userInfo', userInfo)

            // 是否已经关注公众号
            if (userInfo.subscribe === 1) {
              $('.checkFollow').addClass('checkActive')
            }

            // 是否已经免费领取
            if (userInfo.obtain === 1) {
              $('.part-01').find('.btn').hide().siblings('.disable').show()
            }

            // 是否已经分享该活动
            if (shareInfo) {
              var num = new Date().getTime() - shareInfo.time
              if (num < 43200000 && userInfo.openId === shareInfo.openId) {
                // $('.checkShare').addClass('checkActive')
                $('.part-02').find('.btn').addClass('checkActive')
              }
            }

            // 写入PV
            $.ajax({
              type: 'POST',
              url: ip + 'mweb/user/activity/access',
              data: JSON.stringify({
                openId: userInfo.openId,
                acCode: '1001',
                acName: '开门红'
              }),
              contentType: 'application/json',
              dataType: 'json'
            })
          } else {
            $('.error').show()
            $('.dialog').css('display', 'flex')
          }
        },
        error: function () {
          $('.error').show()
          $('.dialog').css('display', 'flex')
        }
      })
    }
  } else {
    // 非微信浏览器文案修改
    $('.index').find('.tips').text('微信搜索公众号『和谐健康』关注后即可领取')
    $('.browser').css('display', 'block').siblings('.wechat').hide()
  }

  // 点击免费领取按钮
  $('.part-01').find('.btn').on('click', function () {
    if (userInfo.subscribe === 1) {
      window.location.href = ip + 'pages/huixinan/index.html#/freeAccident'
    } else {
      $('.share').show()
      $('.dialog').css('display', 'flex')
    }
  })

  // 点击5折投保按钮
  $('.part-02').find('.btn').on('click', function () {
    if (userInfo.subscribe === 1) {
      if ($('.part-02').find('.btn').hasClass('checkActive')) {
        window.location.href = ip + 'pages/huixinan/index.html#/detail?riskCode=1250182&sourceChannel=HXYD&discountName=web'
      } else {
        $('.follow').show()
        $('.dialog').css('display', 'flex')
      }
    } else {
      $('.share').show()
      $('.dialog').css('display', 'flex')
    }
  })

  // 关闭弹出层
  $('.close').on('click', function () {
    $('.share').hide()
    $('.follow').hide()
    $('.error').hide()
    $('.dialog').hide()
  })

  // 分享活动页
  var targetUrl = location.href.split('#')[0]
  var shareUrl = location.href.split('?')[0], // 分享的URL地址
    shareTitle = '劳动最光荣，成果需呵护', // 分享的标题
    shareTimelineTitle = '劳动最光荣，成果需呵护', // 朋友圈分享的标题
    shareImage = ip + 'weixin/huixinan/img/index-76.jpg', // 分享的图片地址
    shareDesc = '四十万出行意外险免费送！给自己穿上交通意外“铠甲”的同时，别忘了给孩子一份重疾险小棉袄' // 分享的描述信息

  $.ajax({
    type: 'POST',
    url: ip + 'mweb/jssdk/getotherwxconfig',
    data: { url: targetUrl },
    contentType: 'application/x-www-form-urlencoded',
    dataType: 'json',
    success: function (res) {
      var data = res.outputObj
      try {
        // eslint-disable-next-line
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: data.appId, // 必填，公众号的唯一标识
          timestamp: data.timestamp, // 必填，生成签名的时间戳
          nonceStr: data.nonceStr, // 必填，生成签名的随机串
          signature: data.signature, // 必填，签名，见附录1
          jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage']// 必填，需要使用的JS接口列表，所有JS接口列表见附录
        })
        // eslint-disable-next-line
        wx.ready(function () {
          // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
          // eslint-disable-next-line
          wx.onMenuShareTimeline({
            title: shareTimelineTitle, // 分享标题
            link: shareUrl, // 分享链接
            imgUrl: shareImage, // 分享图标
            success: function () {
              // 用户确认分享后执行的回调函数
              shareInfo = {
                openId: userInfo.openId,
                time: new Date().getTime()
              }
              storage.set('shareInfo', shareInfo, true)
              // $('.checkShare').addClass('checkActive')
              $('.part-02').find('.btn').addClass('checkActive')
            },
            cancel: function () {
              // 用户取消分享后执行的回调函数
            }
          })
          // eslint-disable-next-line
          wx.onMenuShareAppMessage({
            title: shareTitle, // 分享标题
            desc: shareDesc, // 分享描述
            link: shareUrl, // 分享链接
            imgUrl: shareImage, // 分享图标
            type: '', // 分享类型,music、video或link，不填默认为link
            dataUrl: '', // 如果type是music或video，则要提供数据链接，默认为空
            success: function () {
              // 用户确认分享后执行的回调函数
              shareInfo = {
                openId: userInfo.openId,
                time: new Date().getTime()
              }
              storage.set('shareInfo', shareInfo, true)
              // $('.checkShare').addClass('checkActive')
              $('.part-02').find('.btn').addClass('checkActive')
            },
            cancel: function () {
              // 用户取消分享后执行的回调函数
            }
          })
        })
      } catch (error) {
        console.log(error)
      }
    },
    error: function (res) {
    }
  })

  function getURLParams(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i")
    var result = window.location.search.substr(1).match(reg)
    if (result) {
      return result[2]
    }
  }
})