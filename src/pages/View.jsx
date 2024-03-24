import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { doc, getDoc } from "firebase/firestore";
import { db } from '../firebase/firebase'

const View = () => {
  const [document, setDocument] = useState();
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
          setDocument(documentSnapshot.data())
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


  const winOrLossClass = document?.winOrLoss === 'Win' ? 'text-green-500' : 'text-red-500';
  return (
    <div>
      <nav className='bg-gray-200 p-7'>
        <p className='font-bold'> <Link to={'/'}><span className='cursor-pointer hover:text-blue-400 duration-200'>Home</span></Link> /  <span onClick={() => navigate('/month', { state: { data: data } })} className='cursor-pointer hover:text-blue-400 duration-200'>{data.Month}</span>  /  <span className='hover:text-blue-400 duration-200'>View</span>
        </p>
      </nav>
      <div className=' py-4 px-8 sm:py-10 sm:px-16'>
        <div className="bg-gray-100 shadow-md rounded-lg p-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium">Date: <span className='text-sm font-bold'>{document?.date}  /  {document?.month}</span></span>
                <span className="text-sm font-medium">Time: <span className='text-sm font-bold'>{document?.time}</span></span>
              </div>
            </div>
            <span className={`text-lg font-bold uppercase`}>
              {
                document?.position === true ? <span className='text-blue-500'>OPEN</span> : document?.position === false && document?.winOrLoss === true ? <span className='text-green-500'>WIN  </span> : <span className='text-red-500'>LOSS  </span>
              }
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <h3 className="text-base font-medium">Trade Overview</h3>
              <ul className="list-disc ml-4 mt-2 text-sm">
                <li>Pair:<span className="text-sm font-medium">  {document?.pairName?.toUpperCase()}</span></li>
                <li>Overall Trend: {document?.overAllTrend}</li>
                <li>
                  conviction: <span className={`text-sm font-medium ${document?.conviction === 'HIGH' ? 'text-green-500' :
                    document?.conviction === 'MEDIUM' ? 'text-green-300' :
                      document?.conviction === 'LOW' ? 'text-green-100' :
                        ''}`}>
                    {document?.conviction}
                  </span>
                </li>
                <li>Risk: {document?.risk}%</li>
                <li>R Multiple: {document?.rMultiple}R</li>
                <li>percentage:{document?.percentage === undefined ? <span className='italic text-sm'>  Running</span> : <span className={document.percentage < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{document.percentage}%</span>}</li>
              </ul>
            </div>
            <div className='flex flex-col gap-4'>
              <div>
                <h3 className="text-base font-medium">Entry trigger</h3>
                <p className='font-bold'>{document?.followedFormula}</p>
                <p>{document?.entryTrigger}</p>
              </div>
              <div>
                <h3 className="text-base font-medium">Mental condition</h3>
                <p>{document?.mentalCondition}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-8 mt-4">
            <h3 className="text-2xl font-medium">Screenshots</h3>
            {
              document?.images.map((link, index) => (
                <img
                  key={index}
                  src={link}
                  alt={`Image ${index}`}
                  className="w-[85%] h-auto object-contain "
                />
              ))
            }
          </div>
          <div className='flex flex-col gap-4'>
            <h3 className="text-2xl font-semibold pt-10 underline">Mistakes / explanation</h3>
            <p>{document?.mistakes === undefined ? <span className='italic'>Running</span> : <span>{document.mistakes}</span>}</p>
          </div>
        </div>
      </div>
    </div >
  )
}

export default View