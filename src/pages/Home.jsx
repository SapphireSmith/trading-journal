import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const months = [];

  // Loop through years from 2024 to 2025
  for (let year = 2024; year <= 2025; year++) {
    // Loop through months
    for (let month = 1; month <= 12; month++) {
      // Create an object for each month
      const monthObject = {
        Month: new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' }),
        year: year
      };

      // Add the month object to the array
      months.push(monthObject);
    }
  }

  const renderedMonths = months.map((month, index) => (
    <p key={index} className='m-5 cursor-pointer' onClick={() => navigate('/month', { state: { data: month } })}>
      {month.Month}
    </p>
  ));

  return (
    <main>
      <nav className=''>
        {/* Navigation content */}
      </nav>

      <section className="">
        <div className='section-months-listing p-5'>
          <div className="flex flex-col gap-8">
            {/* Render months for 2024 */}
            <div>
              <h2 className="text-xl font-bold">2024</h2>
              <div className="flex flex-row">
                {renderedMonths.slice(0, 12)}
              </div>
            </div>

            {/* Render months for 2025 */}
            <div>
              <h2 className="text-xl font-bold">2025</h2>
              <div className="flex flex-row">
                {renderedMonths.slice(12)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Home