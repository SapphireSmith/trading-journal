import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom';
import { IoIosCloseCircleOutline } from "react-icons/io";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from '../firebase/firebase'


const Record = () => {

  // State variables for managing files and form data
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    month: '',
    date: new Date().toISOString().split('T')[0],// Get today's date in yyyy-mm-dd format
    time: '',
    pairName: '',
    followedFormula: '',
    overAllTrend: '',
    risk: '',
    rMultiple: '',
    images: [],
    mentalCondition: '',
    entryTrigger: '',
    conviction: '',
    position: true
  });

  // Accessing location and navigation functionality from React Router
  const location = useLocation();
  const navigate = useNavigate();

  // Destructuring assignment to extract data from location state, defaulting to an empty object
  const { data } = location.state || {};

  // Function to handle file input change
  function handleFileChange(e) {
    const uploadedFiles = e.target.files;
    const uploadedUrls = Array.from(uploadedFiles).map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size
    }));
    setFiles(prevFiles => [...prevFiles, ...uploadedUrls]);
  }

  // Function to handle drag over event
  function handleDragOver(e) {
    e.preventDefault();
  }

  // Function to handle file drop event
  function handleDrop(e) {
    e.preventDefault();
    const uploadedFiles = e.dataTransfer.files;
    const uploadedUrls = Array.from(uploadedFiles).map(file => ({
      file,
      url: URL.createObjectURL(file),
      name: file.name,
      type: file.type,
      size: file.size
    }));
    setFiles(prevFiles => [...prevFiles, ...uploadedUrls]);
  }

  // Function to remove an uploaded image
  function removeImage(index) {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }

  //  This function handles changes in a form input field and updates the form data accordingly
  const uppercaseMonth = data.Month.toUpperCase();
  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      month: uppercaseMonth,
      [name]: value
    }));
  }

  // This async function handles form submission by uploading images to Firebase Storage,
  //  setting form data with image URLs, and then adding the form data to a Firestore collection.
  async function handleSubmit(e) {
    e.preventDefault();

    console.log('here');

    if (files.length === 0) {
      alert('Upload images');
      return;
    } else {
      const storageUrls = [];

      const promise = new Promise(async (resolve, reject) => {
        // 1. Upload images to Firebase Storage
        const storage = getStorage();
        for (const file of files) {
          const uniqueFileName = `${Date.now()}-${file.name}`;
          const storageRef = ref(storage, `journal-images/${uniqueFileName}`);
          await uploadBytes(storageRef, file.file);
          const downloadUrl = await getDownloadURL(storageRef);
          storageUrls.push(downloadUrl);
        }

        // 2. Set formData with image URLs
        setFormData((prevForm) => ({
          ...prevForm,
          images: storageUrls,
        }));

        // 3. Combine formData with image URLs
        const formDataWithImages = {
          ...formData,
          images: storageUrls,
        };

        let docId;

        try {
          // Ensure data.month is not empty
          if (!data.Month) {
            throw new Error("Month information is missing.");
          }

          // Get docId from the database
          const querySnapshot = await db.collection(data.Month.toUpperCase()).get();
          querySnapshot.forEach((doc) => {
            docId = doc.id;
            console.log("Document ID:", doc.id);
          });

          if (!docId) {
            console.error("No documents found in collection");
            return;
          }

          const uppercaseMonth = data.Month.toUpperCase();
          const parentCollectionPath = uppercaseMonth;
          const nestedCollectionPath = `${parentCollectionPath}/${docId}/${data.year}`;

          // Upload formDataWithImages to Firestore

          console.log(formDataWithImages);
          await db.collection(nestedCollectionPath).add(formDataWithImages);
          resolve('Upload successful!');
          console.log("Document written..");
          navigate('/month', { state: { data: data } });
        } catch (error) {
          reject('Upload failed. Please try again.' + error.message);
          console.error("Error adding document: ", error);
        }
      });

      toast.promise(promise, {
        pending: 'Uploading...',
        success: 'Upload successful!',
        error: 'Upload failed. Please try again.',
        autoClose: 3000,
      });
    }
  }


  return (
    <div>
      <nav className='bg-gray-200 p-7'>
        <p className='font-bold'> <Link to={'/'}><span className='cursor-pointer hover:text-blue-400 duration-200'>Home</span></Link> /  <span onClick={() => navigate('/month', { state: { data: data } })} className='cursor-pointer hover:text-blue-400 duration-200'>{data.Month}</span>  /  <span className='hover:text-blue-400 duration-200'>Record</span>
        </p>
      </nav>
      <ToastContainer />
      <div className="px-10 sm:px-32 py-26  pb-10 bg-gray-200">
        <form action="" className='flex flex-col' onSubmit={handleSubmit} >
          <div className="flex flex-col p-4">
            <label htmlFor="">Month</label>
            <input type="text" required className={`w-auto border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-400 text-gray-100 font-semibold`}
              value={data.Month} disabled={data.Month ? true : false}
              name='month'
              onChange={handleChange}
            />
          </div>
          <div className="flex flex-row p-4 sm:gap-16 gap-2">
            <div className="flex flex-col flex-auto sm:gap-3">
              <label htmlFor="">Date</label>
              <input className='w-auto border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
                type="date"
                name='date'
                value={formData.date || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex flex-col flex-auto gap-2 pt-1">
              <label htmlFor="">Time</label>
              <input className='w-auto border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
                type="time" name='time'
                value={formData.time || ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="flex flex-col p-4 gap-2">
            <label htmlFor="">Pair name</label>
            <input type="text" name='pairName' className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={formData.pairName || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col p-4 w-full gap-2">
            <label htmlFor="">Followed Formula</label>
            <select name="followedFormula" id="" className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={formData.followedFormula}
              onChange={handleChange}
              required
            >
              <option value='' disabled >Select an option</option>
              <option value="MAEE" >MAEE</option>
              <option value="MBEE" >MBEE</option>
            </select>
          </div>
          <div className="flex flex-col p-4 gap-2">
            <label htmlFor="">Over all trend</label>
            <select name="overAllTrend" id="" className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={formData.overAllTrend || ''}
              onChange={handleChange}
            >
              <option selected disabled value="">Select an option</option>
              <option value="UPTREND">Uptrend</option>
              <option value="DOWNTREND">Downtrend</option>
              <option value="CONSOLIDATION">Consolidation</option>
            </select>
          </div>
          <div className="flex flex-col p-4 gap-2">
            <label htmlFor="">Risk</label>
            <input type="number" name='risk' className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={formData.risk || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col p-4 gap-2">
            <label htmlFor="">R multiple</label>
            <input type="number" name='rMultiple' className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={formData.rMultiple || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col gap-6 flex-auto w-full">
            <label htmlFor="">Add 2 screenshots (The bigger picture, entry tf)</label>
            <div className="flex items-center justify-center w-full"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                  </svg>
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                </div>
                <input id="dropzone-file" type="file" className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-16 py-12">
            {files.map((file, index) => (
              <div key={index} className='relative'>
                <img src={file.url} alt={`Uploaded Image ${index}`} />
                <IoIosCloseCircleOutline size={30} onClick={() => removeImage(index)} className="absolute top-0 right-0 mt-2 mr-2 text-red-500 cursor-pointer" />
              </div>
            ))}
          </div>
          <div className="flex flex-col p-4">
            <label htmlFor="">Before you entering what was your mental Condition ? (Happy,confident,sad,stressed explain how do you feel right know )</label>
            <textarea type="text" name='mentalCondition' className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={formData.mentalCondition || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col p-4">
            <label htmlFor="">Entry trigger  ? ( Candlestick pattern or any other triggers ? explain )</label>
            <textarea type="text" name='entryTrigger' className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={formData.entryTrigger || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex flex-col p-4">
            <label htmlFor="">Conviction</label>
            <select name="conviction" id="" className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              value={formData.conviction || ''}
              onChange={handleChange}
              required
            >
              <option selected disabled value="">Select an option</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <div className='flex justify-center px-6 pt-9 '>
            <button type='submit' className='rounded-md bg-blue-500 w-full text-center py-2 text-white hover:bg-blue-700 duration-200' >Add</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Record
