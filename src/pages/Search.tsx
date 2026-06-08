import React from 'react';
import { usePhotos } from '../context/PhotoContext';
import PhotoGrid from '../components/PhotoGrid';

const Search: React.FC = () => {
  const { photos } = usePhotos();

  return (
    <div className="px-container-padding space-y-section-margin">
      {/* AI Search Bar */}
      <div className="relative mb-6">
        <div className="group relative flex items-center bg-surface-container-low rounded-2xl p-1 shadow-sm border border-outline-variant/20 hover:border-primary/30 transition-all">
          <div className="pl-4 pr-2 text-on-surface-variant">
            <span className="material-symbols-outlined material-symbols-fill text-primary">auto_awesome</span>
          </div>
          <input 
            className="bg-transparent border-none focus:ring-0 w-full py-3 font-body-lg placeholder:text-on-surface-variant/60 outline-none" 
            placeholder="Search your memories..." 
            type="text" 
            defaultValue="Vacation photos in the mountains"
          />
          <button className="p-2 mr-1 rounded-xl text-primary hover:bg-primary-container/10 transition-colors">
            <span className="material-symbols-outlined">mic</span>
          </button>
        </div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-tertiary rounded-full animate-pulse blur-sm opacity-40"></div>
      </div>

      {/* Filter Chips */}
      <section className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-container-padding px-container-padding">
        <button className="flex items-center gap-1.5 bg-primary-container text-on-primary-container px-4 py-2 rounded-full text-label-md font-semibold whitespace-nowrap shadow-sm">
          <span className="material-symbols-outlined text-[18px] material-symbols-fill">star</span>
          Favorites
        </button>
        {['Beach', 'Dogs', '2024', 'Family'].map(tag => (
          <button key={tag} className="bg-surface-container-high text-on-surface-variant px-4 py-2 rounded-full text-label-md font-semibold whitespace-nowrap hover:bg-surface-variant transition-colors">
            {tag}
          </button>
        ))}
      </section>

      {/* People & Pets */}
      <section>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-headline-md font-bold">People & Pets</h2>
          <button className="text-primary text-label-md font-semibold">View all</button>
        </div>
        <div className="flex gap-4 overflow-x-auto hide-scrollbar py-1 -mx-container-padding px-container-padding">
          {[
            { name: 'Sarah', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDn2FgST9CON3MqUJbCAglbhCxXlQ3GuSkOSfQBlzWTGHZIiZQjuk4sF6LI4VeKXj4E47-ld1MZqIC3kKnMVAtpzEPbY3ciQPqEfw2YJ2wH9xRvdDmfPsvaTQoaGIcgooLn_9MF0a5os4CqJKRp2rLbcOWkuIxO7juw78jApP-lZJ9X_pKraoDHnzdcYXdZRNpxABGguBVR0eh30LoGu8aPwVoEVY1X7zvoKj3pESg02Ofd4W9g2nk5OWy5TzGZ2S19-2nni7gFjQk' },
            { name: 'Mark', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-n3T1wW6PhKCX2kLluMKwg93fIAxaOjvZfk0FNFrdq4jhu3bEd9byRrDF1i35TfatXqeAJPrwBkLXXXZl7_ZRqdgRNdkpmHu_Sj6yyacD6Q9Gn3fF4D_y47ljXkU82GqfpqLR692nhmRevLti_PkQnVEGHgmIE7G-dghyKgoT9eD0uDv4gUENrPUUlloSi6aERI4gZEnQp9o39XOpHsvYDSnuWR2m8FgwRVpOiRHRR3TIurD0TBpuhlqwfH2mpa5Otj90yS3G_Do' },
          ].map(person => (
            <div key={person.name} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
              <div className="w-16 h-16 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-background overflow-hidden shadow-md transition-transform group-hover:scale-105">
                <img src={person.url} alt={person.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-label-md font-medium">{person.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Results */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-headline-md font-bold">Results for "Mountain vacation"</h2>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full transition-colors">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
        <PhotoGrid photos={photos.filter(p => p.tags.includes('mountains'))} />
      </section>
    </div>
  );
};

export default Search;
