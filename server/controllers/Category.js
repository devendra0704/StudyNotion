import  { Mongoose } from "mongoose";
import  Category from "../models/Category.js";
function getRandomInt(max) {
    return Math.floor(Math.random() * max)
  }

export const createCategory = async (req, res) => {
	try {
		const {name, description } = req.body;
		if(!name){
			return res.status(400).json({ success: false, message: "All fields are required" });	 
		}

		const CategorysDetails = await Category.create({
			name: name,
			description: description,
		});
		 
		return res.status(400).json({ success: true, message: "Categorys Created Successfully" });	 
	}
   catch (error) {
		return res.status(500).json({
			success: true,
			message: error.message,
		});
	}
};


export const showAllCategories = async (req, res) => {
	try {
        
		const allCategorys = await Category.find({});

    return res.status(200).json({ success: true , data: allCategorys, });	 
	}
   catch (error) {
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
};


//categoryPageDetails 
export const categoryPageDetails = async (req, res) => {
    try {
      const { categoryId } = req.body
     
        // Get courses for the specified category
      const selectedCategory = await Category.findById(categoryId)             
              .populate({
                path: "courses",
                match: { status: "Published" },
                populate: "ratingAndReviews",
              })
              .exec()
  
      // Handle the case when the category is not found
      if(!selectedCategory) {
               return res.status(404).json({ success: false, message: "Category not found" })
      }

       // Handle the case when there are no courses
      if(selectedCategory.courses.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No courses found for the selected category.",
          })
      }
  
      // Get courses for other categories
      const categoriesExceptSelected = await Category.find({ _id: { $ne: categoryId }, })
        
      let differentCategory = await Category.findOne(categoriesExceptSelected[getRandomInt(categoriesExceptSelected.length)]._id)
                .populate({
                  path: "courses",
                  match: { status: "Published" },
                })
                .exec()
        
      // Get top-selling courses across all categories
      const allCategories = await Category.find()
        .populate({
          path: "courses",
          match: { status: "Published" },
          populate: {
            path: "instructor",
        },})
        .exec()

      const allCourses = allCategories.flatMap((category) => category.courses)
      const mostSellingCourses = allCourses.sort((a, b) => b.sold - a.sold).slice(0, 10)

      res.status(200).json({
        success: true,
        data: {selectedCategory, differentCategory, mostSellingCourses,}, 
      })
    } 
    catch (error) {
      return res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }