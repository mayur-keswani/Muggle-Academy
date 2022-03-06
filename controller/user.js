const Post = require("../model/Post");
const Notice = require("../model/Notice");
const Profile = require("../model/Profile");
const User = require("../model/User");
const Video = require("../model/Video");
const Question = require("../model/Questions");

const pdfDocument = require("pdfkit");
const pdfTable = require("pdfkit-table");
const fs = require("fs");
const path = require("path");

const cloudinary = require("cloudinary");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const deleteFileHandler = require("../util/imageDeleteHandler");
const Course = require("../model/Course");

// Type : GET
// Access : Public
// @Desc :Get Index (Carousel Of Posts)
exports.getIndex = (req, res, next) => {
  let posts;
  let notices;
  let courses;
  const role = req.user.role;
  Post.find()
    .then((result) => {
      posts = result;
      return Notice.find(
        role === "admin" ? {} : { noticeFor: role || "student" }
      );
    })
    .then((result) => {
      notices = result;
      return Course.find();
    })
    .then((result) => {
      courses = result;
      res.render("users/index", {
        posts: posts,
        notices: notices,
        courses: courses,
        isAdmin: req.user && req.user.role === "admin" ? true : false,
        isAutherized: req.user ? true : false,
        username: req.user ? req.user.username : null,
      });
    })
    .catch((err) => {
      const error = new Error("Couldn't able to Load");
      console.log(err);
      next(error);
    });
};

// Type : GET
// Access : Public
// @Desc : Get Notices
exports.getNotices = (req, res) => {
  Notice.find()
    .populate("userId")
    .exec((err, notices) => {
      if (!err) {
        let result = {};
        result = notices.reduce(function (r, a) {
          r[a.date.toDateString()] = r[a.date.toDateString()] || [];
          r[a.date.toDateString()].push(a);
          return r;
        }, Object.create(null));

        console.log(result);
        res.render("users/notices", {
          isAdmin: req.user && req.user.role === "admin" ? true : false,
          isAutherized: req.user ? true : false,
          notices: result,
          username: req.user ? req.user.username : null,
        });
      }
    });
};

// Type : GET
// Access : Public
// @Desc : Get Particular Notice-in-Detail
exports.getNoticeDetail = (req, res) => {
  let notice_id = req.params.id;
  Notice.findById(notice_id)
    .then((notice) => {
      res.render("users/notice-detail", {
        notice: notice,
        isAdmin: req.user && req.user.role === "admin" ? true : false,
        isAutherized: req.user ? true : false,

        username: req.user ? req.user.username : null,
      });
    })
    .catch((err) => {
      const error = new Error("Couldn't able to Load...");
      console.log(err);
      next(error);
    });
};

// Type : GET
// Access : Public
// @Desc : Get Lists Of Posts
exports.getPhotos = (req, res) => {
  Post.find().then((posts) => {
    res.render("users/photos", {
      isAdmin: req.user && req.user.role === "admin" ? true : false,
      isAutherized: req.user ? true : false,
      posts: posts,
      username: req.user ? req.user.username : null,
    });
  });
};

// Type : GET
// Access : Public
// @Desc : Get User Profile (Logged-in required)
exports.getUserProfile = (req, res) => {
  Profile.findOne({ userId: req.user }).then((profile) => {
    if (profile) {
      // profile already existed
      res.render("users/profile", {
        profile: profile,
        isAdmin: req.user && req.user.role === "admin" ? true : false,
        isAutherized: req.user ? true : false,
        username: req.user ? req.user.username : null,
      });
    }
  });
};

// Type : POST
// Access : Public
// @Desc : Update/Set Profile on server (Logged-in required)
const cloudinaryUploader = async (image_path) => {
  let image_url;
  image_url = await cloudinary.uploader.upload(image_path, (error, result) => {
    if (!error) {
      url = result.url;
      return url;
    } else {
      console.log(error);
    }
  });
  return image_url ? image_url : null;
};

exports.postUserProfile = async (req, res, next) => {
  let profile_pic = req.file ? req.file : null;
  const college = req.body.college;
  const course = req.body.course;
  const semester = req.body.semester;
  const contact_no = req.body.contact_no;
  const address = req.body.address;
  let image_url;
  if (profile_pic) {
    image_url = await cloudinaryUploader(profile_pic.path);
    deleteFileHandler.deleteFileHandler(profile_pic.path);
  }
  Profile.findOne({ userId: req.user })
    .then((profile) => {
      if (image_url) {
        profile.profile_pic = image_url.url;
      }
      profile.college = college;
      profile.course = course;
      profile.semester = semester;
      profile.contact_no = contact_no;
      profile.address = address;

      return profile.save();
    })
    .then((profile) => {
      console.log("Profile is being updated");
      res.redirect("/");
    })
    .catch((err) => {
      const error = new Error("Couldn't able to update User-Profile");
      console.log(err);
      next(error);
    });
};

// Type : GET
// Access : Public (Loggin-required)
// @Desc : Archieve notice
exports.getNoticeSaved = (req, res, next) => {
  let items = [...req.user.archieved.items];
  const newNotice = { noticeId: req.params.id };
  items.push(newNotice);
  let newArchieved = {
    items: items,
  };
  User.findById(req.user)
    .then((user) => {
      let index = user.archieved.items.findIndex(
        (e) => e.noticeId == req.params.id
      );
      if (index < 0) {
        user.archieved = newArchieved;
      }

      return user.save();
    })
    .then((result) => {
      // alert("SAVED !")
      console.log("Notice saved sucessfully");
      res.redirect("/notices");
    })
    .catch((err) => {
      const error = new Error("Couldn't able to get Saved-Notive");
      console.log(err);
      next(error);
    });
};

// Type : GET
// Access : Public
// @Desc : Get Lists Of Saved-Posts (Logged-in required)
exports.getArchieve = (req, res) => {
  User.findById(req.user)
    .populate("archieved.items.noticeId")
    .exec((err, user) => {
      if (!err) {
        let notices = user.archieved.items;
        res.render("users/archieve", {
          notices: notices,
          isAdmin: req.user && req.user.role === "admin" ? true : false,
          isAutherized: req.user ? true : false,
          username: req.user ? req.user.username : null,
        });
      }
    });
};

// Type : GET
// Access : Public	(Logged-in required)
// @Desc : Get pdf-Format for Notice for offline-read
exports.getNoticeDownload = (req, res) => {
  const notice_id = req.params.id;

  Notice.findById(notice_id)
    .populate("userId")
    .exec((err, notice) => {
      if (!err) {
        const notice_name = `notice+${notice_id}`;
        const pathname = path.join("public", "downloaded_notice", notice_name);
        let pdfDoc = new pdfDocument();

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline;filename=notice.pdf");

        pdfDoc.pipe(fs.createWriteStream(pathname));
        pdfDoc.pipe(res);

        pdfDoc.image("public/assets/gls.png", {
          fit: [150, 100],
          align: "center",
        });
        pdfDoc.text("  ");
        pdfDoc
          .fontSize(25)
          .text("Notice", { underline: true, align: "center" });
        pdfDoc.fontSize(12).text(notice.date);
        pdfDoc.text("  ");
        pdfDoc.text("  ");
        pdfDoc
          .fontSize(15)
          .text(`Subject:${notice.subject}`, { align: "center" });
        pdfDoc.text("  ");
        pdfDoc.text("  ");
        pdfDoc.text("  ");
        pdfDoc.fontSize(12).text(notice.content, { align: "left" });
        pdfDoc.text("  ");
        pdfDoc.text("  ");
        pdfDoc.text("  ");

        pdfDoc.text("  ");

        pdfDoc.text("  ");
        pdfDoc.text("  ");
        pdfDoc.text("  ");
        pdfDoc.fontSize(12).text(notice.userId.username, { align: "left" });
        pdfDoc.fontSize(12).text(notice.designation, { underline: true });
        pdfDoc.end();
      }
    });
};

exports.getCourseReceipt = (req, res, next) => {
  const courseId = req.params.id;
  let courseDetail = req.user.course_enrolled.find(
    (enrolledCourse) => enrolledCourse.courseID.toString() === courseId
  );
  const pathname = path.join("public", "downloaded_notice", "receipt");
  console.log(courseDetail);
  if (courseDetail) {
    Course.findById(courseDetail.courseID).then((course) => {
      if (course) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "inline;filename=receipt.pdf");
        let pdfDoc = new pdfTable();
        pdfDoc.pipe(fs.createWriteStream(pathname));
        pdfDoc.pipe(res);

        pdfDoc.image("public/assets/gls.png", {
          fit: [150, 100],
          align: "center",
        });
        pdfDoc.text("  ");
        pdfDoc
          .fontSize(20)
          .text("Receipt", { underline: true, align: "center" });
        pdfDoc.fontSize(12).text(
          new Date(courseDetail.date).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })
        );
        pdfDoc.text("  ");

        pdfDoc
          .fontSize(14)
          .text(`Subject: Purchase Receipt of ${course.title} Course`, {
            align: "center",
          });
        pdfDoc.text("  ");
        pdfDoc.text("  ");
        const table = {
          title: "",
          subtitle: "",
          headers: ["Course Name", "Date of Purchase", "Price"],
          rows: [
            [
              course.title,
              new Date(courseDetail.date).toLocaleDateString("en-US"),

              "Rs " + courseDetail.price + "/-",
            ],
          ],
        };
        pdfDoc.table(table, {
          // A4 595.28 x 841.89 (portrait) (about width sizes)
          layout: "portrait",
          width: 500,
          //columnsSize: [ 200, 100, 100 ],
        });

        //   pdfDoc.fontSize(12).text(course.content, { align: "left" });
        pdfDoc.text("*Terms and Condition apply");
        pdfDoc.text("  ");
        pdfDoc.text("  ");

        //   pdfDoc.text("  ");

        //   pdfDoc.fontSize(12).text(notice.userId.username, { align: "left" });
        //   pdfDoc.fontSize(12).text(notice.designation, { underline: true });
        pdfDoc.end();
      }
    });
  } else {
    //
  }
};
// Type : GET
// Access : Public	(Logged-in Not required)
// @Desc : Get Full-Course Description
exports.getCourseDetail = (req, res, next) => {
  let isAlreadyPurchased =
    req.user &&
    req.user.course_enrolled.findIndex(
      (enrolledCourse) => enrolledCourse.courseID.toString() === req.params.id
    ) >= 0;
  Course.findById(req.params.id)
    .populate("content.basic")
    .populate("content.intermediate")
    .populate("content.Advance")
    .then((course) => {
      res.render("users/course-detail", {
        isAdmin: req.user && req.user.role === "admin" ? true : false,
        isAutherized: req.user ? true : false,
        username: req.user ? req.user.username : null,
        course: course,
        amICreator: req.user
          ? course.creator.toString() === req.user._id.toString() ||
            course.facultyAccess.includes(req.user.email)
          : false,
        isLogin: req.user ? true : false,
        isAlreadyPurchased: isAlreadyPurchased,
      });
    })
    .catch((err) => {
      const error = new Error("Couldnt able to fetch Course-Detail");
      console.log(err);
      next(error);
    });
};

exports.getMyCourses = (req, res, next) => {
  User.findById(req.user)
    .populate("course_enrolled.courseID")
    .exec((err, user) => {
      if (user) {
        res.render("users/my-courses", {
          isAdmin: req.user && req.user.role === "admin" ? true : false,
          isAutherized: req.user ? true : false,
          username: req.user ? req.user.username : null,
          courses: user.course_enrolled,
        });
      } else {
        const error = new Error("Couldn't able to get your-course");
        console.log(err);
        next(error);
      }
    });
};

exports.getPurchaseCourse = (req, res, next) => {
  let course;
  let token = req.body.stripeToken; // Using Express

  Course.findById(req.params.id)
    .then(async (result) => {
      course = result;
      const charge = await stripe.charges.create({
        amount: course.price * 100,
        currency: "inr",
        description: `${course.title} course`,
        source: token,
        metadata: { user_id: req.user._id.toString() },
      });
      return;
    })
    .then(() => {
      return User.findById(req.user);
    })
    .then((user) => {
      let payload = {
        courseID: course._id,
        date: Date.now(),
        price: course.price,
      };
      user.course_enrolled.push(payload);
      user.save();
    })
    .then((result) => {
      console.log(result);
      res.redirect("/my-courses");
    })
    .catch((err) => {
      const error = new Error("Couldn't able to Purchase-Course");
      console.log(err);
      next(error);
    });
};

exports.getCourseContent = (req, res, next) => {
  Course.findById(req.params.id)
    .populate("content.basic")
    .populate("content.intermediate")
    .populate("content.Advance")
    .populate("questions")
    .then((course) => {
      res.render("users/course-content", {
        course: course,
        isAdmin: req.user ? true : false,
        isAutherized: req.user ? true : false,
        username: req.user ? req.user.username : null,
      });
    });
};

exports.getVideoPlayer = (req, res, next) => {
  Video.findById(req.params.id).then((video) => {
    let isEnrolledCourse = req.user.course_enrolled.findIndex(
      (course) => course.courseID.toString() === video.courseID.toString()
    );

    if (isEnrolledCourse >= 0) {
      res.render("users/video-player", {
        video: video,
        isAdmin: req.user ? true : false,
        isAutherized: req.user ? true : false,
        username: req.user ? req.user.username : null,
      });
    }
  });
};

exports.postQuestion = (req, res) => {
  const question = req.body.question;
  const ques = new Question({
    userID: req.user._id,
    courseID: req.params.id,
    question: question,
    username: req.user.username,
    comments: [],
  });
  ques
    .save()
    .then((result) => {
      return Course.findById(req.params.id);
    })
    .then((course) => {
      course.questions.push(ques._id);
      course.save();
    })
    .then((result) => {
      console.log("Question Post Successfully");
      res.redirect("/course-content/" + req.params.id);
    })
    .catch((error) => {
      console.log("Cant able to post question : " + error);
    });
};

exports.getAddComment = (req, res, next) => {
  Question.findById(req.params.id)
    .populate("comments.userID")
    .then((question) => {
      res.render("users/comments", {
        question: question,
        isAdmin: req.user ? true : false,
        isAutherized: req.user ? true : false,
        username: req.user ? req.user.username : null,
      });
    })
    .catch((err) => {
      const error = new Error("Couldn't get comments");
      next(error);
    });
};

exports.postAddComment = (req, res, next) => {
  Question.findById(req.params.id)
    .then((question) => {
      question.comments.push({ userID: req.user, answer: req.body.comment });
      question.save();
    })
    .then((result) => {
      res.redirect("/add-comment/" + req.params.id);
    })
    .catch((err) => {
      const error = new Error("Couldnt get comments");
      next(error);
    });
};
