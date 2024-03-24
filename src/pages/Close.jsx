import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { IoIosCloseCircleOutline } from "react-icons/io";
import { doc, getDoc } from "firebase/firestore";
import { ToastContainer, toast } from 'react-toastify';
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { db } from '../firebase/firebase'


const Close = () => {
  const [files, setFiles] = useState([]);
  const [record, setRecord] = useState();
  const [form, setForm] = useState({
    percentage: 0,
    winOrLoss: false,
    gamePlan: '',
    mistakes: ''
  })
  const navigate = useNavigate();
  const location = useLocation();
  const { data, id } = location.state || {};

  useEffect(() => {
    const fetchData = async () => {
      try {

        const querySnapshot = await db.collection(data.Month.toUpperCase()).get();
        let docId;
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
        const pathOfDocument = `${parentCollectionPath}/${docId}/${data.year}`;

        const documentRef = doc(db, pathOfDocument, id);
        const documentSnapshot = await getDoc(documentRef);

        if (documentSnapshot.exists()) {
          setRecord(documentSnapshot.data())
        } else {
          // Document does not exist
          console.log("Document not found");
        }
      } catch (error) {
        console.error("Error fetching document:", error);
      }
    };
    fetchData(); // Immediately invoke the function
  }, [data, id]);

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

  function handleDragOver(e) {
    e.preventDefault();
  }

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

  function removeImage(index) {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (files.length === 0) {
      alert('Upload images');
      return;
    } else {
      const promise = new Promise(async (resolve, reject) => {
        try {
          // 1. Upload images to Firebase Storage
          const storage = getStorage();
          const storageUrls = [];
          for (const file of files) {
            const uniqueFileName = `${Date.now()}-${file.name}`;
            const storageRef = ref(storage, `journal-images/${uniqueFileName}`);
            await uploadBytes(storageRef, file.file);
            const downloadUrl = await getDownloadURL(storageRef);
            storageUrls.push(downloadUrl);
          }
          // Convert percentage string to a number
          const percentage = parseFloat(form.percentage);
          // Check if the number is negative to determine winOrLoss
          const winOrLoss = percentage < 0 ? false : true;
          setRecord((prev) => ({
            ...prev,
            ...form,
            winOrLoss: winOrLoss,
            position: false,
            images: [...record.images, ...storageUrls] // Concatenate existing images with new URLs
          }))
          const updatedRecord = {
            ...form,
            winOrLoss: winOrLoss,
            position: false,
            images: [...record.images, ...storageUrls]
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
            // Uploading to Firebase Firestore
            db.collection(nestedCollectionPath).doc(id).set(updatedRecord, { merge: true }) // Use merge option here
              .then((res) => {
                console.log("Document written with ID: ", id); // 'res' may not contain the document ID
                resolve('Upload successful!');
                navigate('/month', { state: { data: data } });
              })
              .catch((error) => {
                console.error("Error adding document: ", error);
                reject('Upload failed. Please try again.' + error.message);
              });
          } catch (error) {
            reject('Upload failed. Please try again.' + error.message);
            console.error("Error adding document: ", error);
          }
        } catch (error) {
          console.error("Error adding document: ", error);
          reject('Upload failed. Please try again.' + error.message);
        }
      });
      toast.promise(promise, {
        pending: 'Uploading...',
        success: 'Upload successful!',
        error: 'Upload failed. Please try again.',
        autoClose: 3000, // Adjust autoClose delay as needed
      });
    }
  }

  return (
    <div>
      <nav className='bg-gray-200 p-7'>
        <p className='font-bold'> <Link to={'/'}><span className='cursor-pointer hover:text-blue-400 duration-200'>Home</span></Link> /  <span onClick={() => navigate('/month', { state: { data: data } })} className='cursor-pointer hover:text-blue-400 duration-200'>{data.Month}</span>  /  <span className='hover:text-blue-400 duration-200'>Close</span>
        </p>
      </nav>
      <ToastContainer />

      <div className="px-10 sm:px-32 py-26  pb-10 bg-gray-200">
        <form action="" className='flex flex-col' onSubmit={handleSubmit} >

          {/* formula display */}
          <div className="flex flex-col p-4 w-full gap-2">
            <label htmlFor="">Followed formula</label>
            <input type="text" className='border rounded-md px-3 py-2 bg-gray-500 text-white  focus:outline-none focus:ring-2 focus:ring-blue-500'
              defaultValue={record && record.followedFormula || ''}
              disabled={record && true || false}
              required
            />
          </div>

          {/* winn or loss */}
          <div className="flex flex-col p-4 gap-2">
            <label htmlFor="">Win/Loss (in percentage)</label>
            <input type="text" name='percentage' className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              onChange={handleChange}
              required />
          </div>

          {/* exit screenshot  */}
          <div className="flex flex-col gap-6 flex-auto w-full">
            <label htmlFor="">Add Exit screenshot</label>
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
                <input id="dropzone-file" onChange={handleFileChange} type="file" className="hidden" />
              </label>
            </div>
          </div>
          <div className="flex flex-col gap-16 py-10">
            {files.map((file, index) => (
              <div key={index} className='relative'>
                <img src={file.url} alt={`Uploaded Image ${index}`} />
                <IoIosCloseCircleOutline size={30} onClick={() => removeImage(index)} className="absolute top-0 right-0 mt-2 mr-2 text-red-500 cursor-pointer" />
              </div>
            ))}
          </div>

          {/* mistakes */}
          <div className="flex flex-col p-4 gap-2">
            <label htmlFor="">explain the trade ie.Mistakes:</label>
            <textarea type="text" name='mistakes' className='border rounded-md px-3 py-2  focus:outline-none focus:ring-2 focus:ring-blue-500'
              onChange={handleChange}
            />
          </div>

          <div className='flex justify-center px-6 pt-9 '>
            <button type='submit' className='rounded-md bg-blue-500 w-full text-center py-2 text-white hover:bg-blue-700 duration-200'>Add</button>
          </div>
        </form>

      </div>
    </div>
  )
}

export default Close


