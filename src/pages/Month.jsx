import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebase'

const Month = () => {
  const [trades, setTrades] = useState([]);
  const location = useLocation();
  const { data } = location.state || {};
  const navigate = useNavigate();

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
        const nestedCollectionPath = `${parentCollectionPath}/${docId}/${data.year}`;

        const nestedSnapshot = await db.collection(nestedCollectionPath).get();
        const tradesData = [];
        nestedSnapshot.forEach((doc) => {
          tradesData.push({ id: doc.id, ...doc.data() });
        });
        tradesData.sort((a, b) => new Date(a.date) - new Date(b.date));
        setTrades(tradesData);
      } catch (error) {
        console.error("Error:", error);
      }
    };
    if (data) {
      fetchData();
    }
  }, [data]);

  return (
    <div className='bg-gray-200'>
      <nav className='p-7'>
        <p className='font-bold'> <Link to={'/'}> <span className='cursor-pointer hover:text-blue-400 duration-200'>Home</span></Link> /  <span className='hover:text-blue-400 duration-200'>{data.Month}</span></p>
      </nav>

      <div className="relative overflow-x-auto shadow-md sm:rounded-lg md:px-10 sm:px-4 pt-7">
        <div>
          <h2 className="md:text-4xl text-3xl font-bold text-center font-custom-font text-shadow-md">{data.Month} {data.year}</h2>
        </div>
        <div className='py-7 flex justify-end'>
          <a onClick={() => navigate('/record', { state: { data: data } })}
            className="inline-flex items-center justify-center w-full px-6 py-3 mb-2 text-lg text-white bg-green-500 rounded-md hover:bg-green-400 sm:w-auto sm:mb-0" data-primary="green-400" data-rounded="rounded-2xl" data-primary-reset="{}">
            record
            <svg className="w-4 h-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </a>
        </div>
        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">
                Date
              </th>
              <th scope="col" className="px-6 py-3">
                Pair
              </th>
              <th scope="col" className="px-6 py-3">
                Entry Trigger
              </th>
              <th scope="col" className="px-6 py-3">
                Risk per trade
              </th>
              <th scope="col" className="px-6 py-3">
                Conviction
              </th>
              <th scope="col" className="px-6 py-3">
                Percentage (%)
              </th>
              <th scope="col" className="px-6 py-3">
                Win/Loss
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
              <th scope="col" className="px-6 py-3">
                <span className="sr-only">Edit</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {
              trades.map((v) => {
                return (
                  <tr key={v.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {v.date}
                    </td>
                    <td className="px-6 py-4">
                      {v.pairName}
                    </td>
                    <td className="px-6 py-4">
                      {v.entryTrigger}
                    </td>
                    <td className="px-6 py-4">
                      {v.risk}%
                    </td>
                    <td className="px-6 py-4">
                      {v.conviction === 'LOW' ? (
                        <span>{v.conviction}</span>
                      ) : v.conviction === 'MEDIUM' ? (
                        <span className="text-gray-300">{v.conviction}</span>
                      ) : (
                        <span className="text-white">{v.conviction}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={v.percentage < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{v.percentage}</span>
                    </td>
                    <td className="px-6 py-4">
                      {v.winOrLoss ? 'Win' : ''}
                      {v.position === false && v.winOrLoss === false ? 'Loss' : ''}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {
                        v.position && <a onClick={() => navigate('/close', { state: { data: data, id: v.id } })} className="font-semibold text-blue-600 dark:text-blue-500 hover:underline">close /</a>
                      }
                      <a onClick={() => navigate('/record', { state: { data: data, id: v.id } })} className="font-semibold text-blue-600 dark:text-blue-500 hover:underline"> edit</a>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <a onClick={() => navigate('/view', { state: { data: data, id: v.id } })} className="font-medium text-blue-600 dark:text-blue-500 hover:underline">View</a>
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>
        <div className='py-7 flex justify-end'>
          <a onClick={() => navigate('/view-all', { state: { data: data } })}
            className="inline-flex items-center hover:translate-x-2 justify-center w-full px-3 py-2 mb-2 text-md text-white bg-blue-500 rounded-md hover:bg-blue-400 duration-200 sm:w-auto sm:mb-0" data-primary="green-400" data-rounded="rounded-2xl" data-primary-reset="{}">
            view all
            <svg className="w-4 h-4 ml-1 duration-700" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
          </a>
        </div>
      </div>
    </div>

  )
}

export default Month
