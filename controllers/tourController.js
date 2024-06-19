const Tour = require('./../models/tourModel');

exports.getAllTours = async (req, res) => {
  try {
    // Step 1: Filtering
    // Create a hard copy of req.query to manipulate without altering the original request
    const queryObj = { ...req.query }; // Original query object after removing excluded fields
    console.log(queryObj);
    // Define fields that should not be used for filtering but are reserved for other functionalities
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    // Remove these fields from the query object to isolate only the fields meant for filtering
    excludedFields.forEach(el => delete queryObj[el]);

    // Step 2: Advanced Filtering
    // Convert query object to string to manipulate
    let queryStr = JSON.stringify(queryObj);
    // Replace filtering operators (gte, gt, lte, lt) with MongoDB's query operators ($gte, $gt, $lte, $lt)
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

    // Debugging: Log the original and modified query objects
    // console.log(queryObj); // Original query object after removing excluded fields
    // console.log(JSON.parse(queryStr)); // Modified query object with MongoDB operators

    // Step 3: Executing Query
    // Build the query with the modified query string. Additional functionalities like sort, paginate can be chained here.
    let query = Tour.find(JSON.parse(queryStr));

    // Step 4: SORTING
    // Check if a sort parameter is provided in the query string
    if (req.query.sort) {
      // If a sort parameter exists, it means the client wants to sort the results based on one or more fields.
      // The sort parameter can include multiple fields separated by commas, e.g., "price,ratingsAverage"

      // Convert the sort parameter from comma-separated values to space-separated values
      // This is because MongoDB expects space-separated fields for sorting
      // For example, "price,ratingsAverage" becomes "price ratingsAverage"
      const sortBy = req.query.sort.split(`,`).join(` `);

      // Log the sortBy value to the console for debugging purposes
      // This helps in understanding what fields the query is being sorted by
      console.log(sortBy);

      // Apply the sorting to the query
      // The sort method modifies the query to include the sorting order
      // If sortBy is "price ratingsAverage", it sorts by price first, then by ratingsAverage
      query = query.sort(sortBy);
    } else {
      // If no sort parameter is provided, default to sorting by createdAt field in descending order
      // This means the most recently created documents will be returned first
      // The "-" before "createdAt" indicates descending order. Without "-", it would be ascending.
      query = query.sort(`-createdAt`);
    }

    // Step 4 FIELD LIMITING
    if (req.query.fields) {
      const fields = req.query.fields.split(`,`).join(` `);
      query = query.select(fields); //
    } else {
      query = query.select(`-__v`);
    }
    // Execute the query to get the list of tours that match the query criteria
    const tours = await query;
    // Count the number of tours returned to include in the response
    const tourCount = tours.length;

    // Step 4: Sending Response
    // Respond with the list of tours and the count
    res.status(200).json({
      status: 'success',
      data: {
        message: `Showing ${tourCount} tours on this page`,
        tours: tours
      }
    });
  } catch (err) {
    // Error Handling: Respond with a 404 status code and the error message if the query fails
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const id = req.params.id; // This is not neccesary but good for increaseing understand code readabilty
    const tour = await Tour.findById(id); // findById can take 3 params (id, project, options)
    // const tour = await Tour.findOne({ _id: req.params.id });
    res.status(200).json({
      status: 'success',
      data: {
        tour: tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(
      req.body
      // mongoose create() method can take options argument as a 2.
    );

    res.status(201).json({
      status: 'success',
      data: {
        message: `Tour saved succesfuly`,
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedTour = await Tour.findByIdAndUpdate(id, req.body, {
      runValidators: true,
      new: true
    });
    // This is normal query system for mongoose but upper code is more elegant
    // const updatedTour = await Tour.findOneAndUpdate({ _id: id }, req.body, {
    //   runValidators: true,
    //   new: true
    // });

    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: `fail`,
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    const id = req.params.id;
    const tour = await Tour.findByIdAndDelete(id);

    if (!tour) {
      return res.status(404).json({
        status: 'fail',
        message: 'No tour found with that ID'
      });
    }

    res.status(204).json({
      // status(204) won`t show message or data if this is important use status(200)
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message // It's often helpful to return the error message for debugging purposes.
    });
  }
};
