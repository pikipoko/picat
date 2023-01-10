const User = require("../models/User");
const Img = require("../models/Image");
const { getDescriptorsFromDB } = require("../config/face_api");

let uploadImage = async function (req, res, next) {
  try {
    const data = req.files;
    let images = [];
    let imgCnt = 0;
    let checkResult = [];

    for (let i = 0; i < data.length; i++) {
      /* mongo DB에 id, url 저장하는 코드 추가 필요 */
      const newImg = new Img();
      const id = parseInt(req.body.id);
      let user = await User.findOne({ id: id }).exec();
      let roomIdx = user.roomIdx;

      newImg.roomIdx = roomIdx;
      newImg.id = id;
      newImg.url = data[i].location;

      images[imgCnt] = data[i].location;
      await newImg
        .save() //실제로 저장된 유저값 불러옴
        .then(async (user) => {
          const DescriptorsFromDB = await getDescriptorsFromDB(
            data[imgCnt].location,
            id
          );
          if (DescriptorsFromDB) checkResult.push(DescriptorsFromDB);
          console.log(`[${imgCnt}] DB저장 ${checkResult}`);
          imgCnt++;
        })
        .catch((err) => {
          res.json({
            message: "이미지 생성정보 db저장실패",
          });
          console.error(err);
        });
    }

    res.json({
      url: images,
      img_cnt: imgCnt,
      friends: checkResult,
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

module.exports = { uploadImage };
