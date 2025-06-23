import Database from 'better-sqlite3';
import path from 'path';

const additionalBooks: [string, string, number, string, string][] = [
  // Modern Classics (1950-2000)
  ['The Catcher in the Rye', 'J.D. Salinger', 1951, 'A novel about teenage alienation and loss of innocence in post-World War II America.', 'Classic'],
  ['To Kill a Mockingbird', 'Harper Lee', 1960, 'The story of young Scout Finch and her father Atticus in a racially divided Alabama town.', 'Classic'],
  ['1984', 'George Orwell', 1949, 'A dystopian novel about totalitarianism and surveillance society.', 'Dystopian'],
  ['Animal Farm', 'George Orwell', 1945, 'An allegorical novella about a group of farm animals who rebel against their human farmer.', 'Satire'],
  ['Lord of the Flies', 'William Golding', 1954, 'A novel about a group of British boys stranded on an uninhabited island and their disastrous attempt to govern themselves.', 'Classic'],
  ['The Lord of the Rings', 'J.R.R. Tolkien', 1954, 'An epic high-fantasy novel about the quest to destroy a powerful ring.', 'Fantasy'],
  ['The Hobbit', 'J.R.R. Tolkien', 1937, 'A fantasy novel about a hobbit who embarks on a quest to reclaim a dwarf kingdom.', 'Fantasy'],
  ['The Chronicles of Narnia', 'C.S. Lewis', 1950, 'A series of fantasy novels about children who discover a magical world.', 'Fantasy'],
  ['Fahrenheit 451', 'Ray Bradbury', 1953, 'A dystopian novel about a future society where books are banned and burned.', 'Dystopian'],
  ['Brave New World', 'Aldous Huxley', 1932, 'A dystopian novel about a futuristic society where people are genetically engineered and conditioned.', 'Dystopian'],
  ['The Handmaid\'s Tale', 'Margaret Atwood', 1985, 'A dystopian novel about a woman living in a totalitarian society where women are treated as property.', 'Dystopian'],
  ['The Bell Jar', 'Sylvia Plath', 1963, 'A semi-autobiographical novel about a young woman\'s struggle with mental illness.', 'Classic'],
  ['Slaughterhouse-Five', 'Kurt Vonnegut', 1969, 'A satirical novel about the bombing of Dresden during World War II.', 'Satire'],
  ['Catch-22', 'Joseph Heller', 1961, 'A satirical novel about the absurdity of war and bureaucracy.', 'Satire'],
  ['One Flew Over the Cuckoo\'s Nest', 'Ken Kesey', 1962, 'A novel about a mental institution and the battle between patients and authority.', 'Classic'],
  ['The Color Purple', 'Alice Walker', 1982, 'A novel about the life of African American women in the rural South.', 'Classic'],
  ['Beloved', 'Toni Morrison', 1987, 'A novel about a former slave haunted by the ghost of her dead daughter.', 'Classic'],
  ['Song of Solomon', 'Toni Morrison', 1977, 'A novel about an African American man\'s search for identity and family history.', 'Classic'],
  ['The Bluest Eye', 'Toni Morrison', 1970, 'A novel about a young African American girl who longs for blue eyes.', 'Classic'],
  ['Invisible Man', 'Ralph Ellison', 1952, 'A novel about an African American man\'s search for identity in a racially divided society.', 'Classic'],
  
  // Contemporary Literature (2000-Present)
  ['The Road', 'Cormac McCarthy', 2006, 'A post-apocalyptic novel about a father and son\'s journey through a devastated America.', 'Dystopian'],
  ['No Country for Old Men', 'Cormac McCarthy', 2005, 'A crime novel about a man who finds drug money and the violence that follows.', 'Mystery'],
  ['Blood Meridian', 'Cormac McCarthy', 1985, 'A novel about violence and brutality in the American West.', 'Historical'],
  ['The Kite Runner', 'Khaled Hosseini', 2003, 'A novel about friendship, betrayal, and redemption in Afghanistan.', 'Historical'],
  ['A Thousand Splendid Suns', 'Khaled Hosseini', 2007, 'A novel about the lives of two women in Afghanistan.', 'Historical'],
  ['The Book Thief', 'Markus Zusak', 2005, 'A novel about a young girl who steals books during Nazi Germany.', 'Historical'],
  ['Life of Pi', 'Yann Martel', 2001, 'A novel about a young man stranded at sea with a Bengal tiger.', 'Adventure'],
  ['The Curious Incident of the Dog in the Night-Time', 'Mark Haddon', 2003, 'A novel about a 15-year-old boy with autism who investigates a mystery.', 'Mystery'],
  ['The Lovely Bones', 'Alice Sebold', 2002, 'A novel about a young girl who watches from heaven as her family deals with her murder.', 'Mystery'],
  ['The Time Traveler\'s Wife', 'Audrey Niffenegger', 2003, 'A novel about a man with a genetic disorder that causes him to time travel.', 'Science Fiction'],
  ['The Da Vinci Code', 'Dan Brown', 2003, 'A thriller about a murder in the Louvre and a religious mystery.', 'Mystery'],
  ['Angels & Demons', 'Dan Brown', 2000, 'A thriller about a murder at CERN and a religious conspiracy.', 'Mystery'],
  ['The Girl with the Dragon Tattoo', 'Stieg Larsson', 2005, 'A crime novel about a journalist and a computer hacker investigating a murder.', 'Mystery'],
  ['The Hunger Games', 'Suzanne Collins', 2008, 'A dystopian novel about teenagers forced to fight to the death in a televised event.', 'Dystopian'],
  ['Catching Fire', 'Suzanne Collins', 2009, 'The second book in the Hunger Games trilogy.', 'Dystopian'],
  ['Mockingjay', 'Suzanne Collins', 2010, 'The final book in the Hunger Games trilogy.', 'Dystopian'],
  ['Twilight', 'Stephenie Meyer', 2005, 'A romance novel about a teenage girl who falls in love with a vampire.', 'Romance'],
  ['New Moon', 'Stephenie Meyer', 2006, 'The second book in the Twilight series.', 'Romance'],
  ['Eclipse', 'Stephenie Meyer', 2007, 'The third book in the Twilight series.', 'Romance'],
  ['Breaking Dawn', 'Stephenie Meyer', 2008, 'The final book in the Twilight series.', 'Romance'],
  ['Harry Potter and the Philosopher\'s Stone', 'J.K. Rowling', 1997, 'The first book in the Harry Potter series about a young wizard.', 'Fantasy'],
  ['Harry Potter and the Chamber of Secrets', 'J.K. Rowling', 1998, 'The second book in the Harry Potter series.', 'Fantasy'],
  ['Harry Potter and the Prisoner of Azkaban', 'J.K. Rowling', 1999, 'The third book in the Harry Potter series.', 'Fantasy'],
  ['Harry Potter and the Goblet of Fire', 'J.K. Rowling', 2000, 'The fourth book in the Harry Potter series.', 'Fantasy'],
  ['Harry Potter and the Order of the Phoenix', 'J.K. Rowling', 2003, 'The fifth book in the Harry Potter series.', 'Fantasy'],
  ['Harry Potter and the Half-Blood Prince', 'J.K. Rowling', 2005, 'The sixth book in the Harry Potter series.', 'Fantasy'],
  ['Harry Potter and the Deathly Hallows', 'J.K. Rowling', 2007, 'The final book in the Harry Potter series.', 'Fantasy'],
  ['The Fault in Our Stars', 'John Green', 2012, 'A novel about two teenagers with cancer who fall in love.', 'Romance'],
  ['Looking for Alaska', 'John Green', 2005, 'A novel about a teenager who falls in love with a mysterious girl.', 'Romance'],
  ['Paper Towns', 'John Green', 2008, 'A novel about a boy who goes on a road trip to find a missing girl.', 'Adventure'],
  ['An Abundance of Katherines', 'John Green', 2006, 'A novel about a boy who has dated 19 girls named Katherine.', 'Romance'],
  ['Turtles All the Way Down', 'John Green', 2017, 'A novel about a teenage girl dealing with anxiety and OCD.', 'Romance'],
  ['Divergent', 'Veronica Roth', 2011, 'A dystopian novel about a society divided into factions.', 'Dystopian'],
  ['Insurgent', 'Veronica Roth', 2012, 'The second book in the Divergent trilogy.', 'Dystopian'],
  ['Allegiant', 'Veronica Roth', 2013, 'The final book in the Divergent trilogy.', 'Dystopian'],
  ['The Maze Runner', 'James Dashner', 2009, 'A dystopian novel about teenagers trapped in a maze.', 'Dystopian'],
  ['The Scorch Trials', 'James Dashner', 2010, 'The second book in the Maze Runner series.', 'Dystopian'],
  ['The Death Cure', 'James Dashner', 2011, 'The final book in the Maze Runner series.', 'Dystopian'],
  ['The Perks of Being a Wallflower', 'Stephen Chbosky', 1999, 'A novel about a shy teenager navigating high school.', 'Romance'],
  ['The Help', 'Kathryn Stockett', 2009, 'A novel about African American maids working in white households in the 1960s.', 'Historical'],
  ['Water for Elephants', 'Sara Gruen', 2006, 'A novel about a veterinary student who joins a traveling circus during the Great Depression.', 'Historical'],
  ['The Night Circus', 'Erin Morgenstern', 2011, 'A novel about a magical competition between two young magicians.', 'Fantasy'],
  ['The Goldfinch', 'Donna Tartt', 2013, 'A novel about a boy who survives a terrorist attack at an art museum.', 'Classic'],
  ['All the Light We Cannot See', 'Anthony Doerr', 2014, 'A novel about a blind French girl and a German boy during World War II.', 'Historical'],
  ['The Underground Railroad', 'Colson Whitehead', 2016, 'A novel about a young woman escaping slavery on a literal underground railroad.', 'Historical'],
  ['Homegoing', 'Yaa Gyasi', 2016, 'A novel about the descendants of two half-sisters in Ghana.', 'Historical'],
  ['The Sellout', 'Paul Beatty', 2015, 'A satirical novel about race and identity in America.', 'Satire'],
  ['Less', 'Andrew Sean Greer', 2017, 'A novel about a failed novelist who travels around the world to avoid his ex-boyfriend\'s wedding.', 'Romance'],
  ['The Overstory', 'Richard Powers', 2018, 'A novel about nine Americans whose lives are connected by trees.', 'Classic'],
  ['The Testaments', 'Margaret Atwood', 2019, 'A sequel to The Handmaid\'s Tale about the fall of Gilead.', 'Dystopian'],
  ['Normal People', 'Sally Rooney', 2018, 'A novel about the complex relationship between two teenagers in Ireland.', 'Romance'],
  ['Conversations with Friends', 'Sally Rooney', 2017, 'A novel about a young woman\'s relationships with her best friend and a married couple.', 'Romance'],
  ['Beautiful World, Where Are You', 'Sally Rooney', 2021, 'A novel about four friends navigating love and friendship in their thirties.', 'Romance'],
  ['Klara and the Sun', 'Kazuo Ishiguro', 2021, 'A novel about an artificial friend who observes the world around her.', 'Science Fiction'],
  ['The Seven Husbands of Evelyn Hugo', 'Taylor Jenkins Reid', 2017, 'A novel about a Hollywood starlet who reveals the truth about her seven marriages.', 'Historical'],
  ['Daisy Jones & The Six', 'Taylor Jenkins Reid', 2019, 'A novel about a fictional rock band in the 1970s.', 'Historical'],
  ['Malibu Rising', 'Taylor Jenkins Reid', 2021, 'A novel about four famous siblings who throw an epic party to celebrate the end of summer.', 'Historical'],
  ['Carrie Soto Is Back', 'Taylor Jenkins Reid', 2022, 'A novel about a retired tennis champion who makes a comeback.', 'Historical'],
  ['Tomorrow, and Tomorrow, and Tomorrow', 'Gabrielle Zevin', 2022, 'A novel about two friends who create video games together.', 'Romance'],
  ['Lessons in Chemistry', 'Bonnie Garmus', 2022, 'A novel about a female scientist who becomes a cooking show host in the 1960s.', 'Historical'],
  ['Demon Copperhead', 'Barbara Kingsolver', 2022, 'A modern retelling of David Copperfield set in Appalachia.', 'Classic'],
  ['Trust', 'Hernan Diaz', 2022, 'A novel about wealth and power in 1920s New York.', 'Historical'],
  ['The Candy House', 'Jennifer Egan', 2022, 'A novel about technology and memory in the near future.', 'Science Fiction'],
  ['Sea of Tranquility', 'Emily St. John Mandel', 2022, 'A novel about time travel and the nature of reality.', 'Science Fiction'],
  ['Station Eleven', 'Emily St. John Mandel', 2014, 'A novel about a traveling theater troupe in a post-apocalyptic world.', 'Dystopian'],
  ['The Glass Hotel', 'Emily St. John Mandel', 2020, 'A novel about a Ponzi scheme and its aftermath.', 'Mystery'],
  ['Cloud Cuckoo Land', 'Anthony Doerr', 2021, 'A novel that connects five characters across time and space.', 'Historical'],
  ['The Lincoln Highway', 'Amor Towles', 2021, 'A novel about two brothers on a cross-country road trip in 1950s America.', 'Adventure'],
  ['A Gentleman in Moscow', 'Amor Towles', 2016, 'A novel about a Russian aristocrat under house arrest in a Moscow hotel.', 'Historical'],
  ['Rules of Civility', 'Amor Towles', 2011, 'A novel about a young woman navigating New York society in the 1930s.', 'Historical'],
  ['The Midnight Library', 'Matt Haig', 2020, 'A novel about a library between life and death where each book represents a different life.', 'Fantasy'],
  ['How to Stop Time', 'Matt Haig', 2017, 'A novel about a man who ages very slowly and has lived for centuries.', 'Fantasy'],
  ['The Humans', 'Matt Haig', 2013, 'A novel about an alien who takes over a human\'s body to learn about humanity.', 'Science Fiction'],
  ['Reasons to Stay Alive', 'Matt Haig', 2015, 'A memoir about depression and recovery.', 'Nonfiction'],
  ['Notes on a Nervous Planet', 'Matt Haig', 2018, 'A book about anxiety and modern life.', 'Nonfiction'],
  ['The Thursday Murder Club', 'Richard Osman', 2020, 'A novel about four elderly friends who solve murders.', 'Mystery'],
  ['The Man Who Died Twice', 'Richard Osman', 2021, 'The second book in the Thursday Murder Club series.', 'Mystery'],
  ['The Bullet That Missed', 'Richard Osman', 2022, 'The third book in the Thursday Murder Club series.', 'Mystery'],
  ['The Last Devil to Die', 'Richard Osman', 2023, 'The fourth book in the Thursday Murder Club series.', 'Mystery'],
  ['Project Hail Mary', 'Andy Weir', 2021, 'A science fiction novel about an astronaut who wakes up alone on a spaceship.', 'Science Fiction'],
  ['The Martian', 'Andy Weir', 2011, 'A novel about an astronaut stranded on Mars who must find a way to survive.', 'Science Fiction'],
  ['Artemis', 'Andy Weir', 2017, 'A novel about a smuggler living in a city on the moon.', 'Science Fiction'],
  ['The Three-Body Problem', 'Liu Cixin', 2008, 'A science fiction novel about humanity\'s first contact with an alien civilization.', 'Science Fiction'],
  ['The Dark Forest', 'Liu Cixin', 2008, 'The second book in the Three-Body Problem trilogy.', 'Science Fiction'],
  ['Death\'s End', 'Liu Cixin', 2010, 'The final book in the Three-Body Problem trilogy.', 'Science Fiction'],
  ['The Fifth Season', 'N.K. Jemisin', 2015, 'The first book in the Broken Earth trilogy about a world plagued by apocalyptic climate change.', 'Fantasy'],
  ['The Obelisk Gate', 'N.K. Jemisin', 2016, 'The second book in the Broken Earth trilogy.', 'Fantasy'],
  ['The Stone Sky', 'N.K. Jemisin', 2017, 'The final book in the Broken Earth trilogy.', 'Fantasy'],
  ['The City We Became', 'N.K. Jemisin', 2020, 'A novel about New York City coming to life as human avatars.', 'Fantasy'],
  ['The World We Make', 'N.K. Jemisin', 2022, 'The sequel to The City We Became.', 'Fantasy'],
  ['The Hundred Thousand Kingdoms', 'N.K. Jemisin', 2010, 'The first book in the Inheritance trilogy.', 'Fantasy'],
  ['The Broken Kingdoms', 'N.K. Jemisin', 2010, 'The second book in the Inheritance trilogy.', 'Fantasy'],
  ['The Kingdom of Gods', 'N.K. Jemisin', 2011, 'The final book in the Inheritance trilogy.', 'Fantasy'],
  ['The Poppy War', 'R.F. Kuang', 2018, 'A fantasy novel inspired by Chinese history about a war orphan who becomes a military prodigy.', 'Fantasy'],
  ['The Dragon Republic', 'R.F. Kuang', 2019, 'The second book in the Poppy War trilogy.', 'Fantasy'],
  ['The Burning God', 'R.F. Kuang', 2020, 'The final book in the Poppy War trilogy.', 'Fantasy'],
  ['Babel', 'R.F. Kuang', 2022, 'A novel about translation, colonialism, and revolution in 1830s Oxford.', 'Fantasy'],
  ['Yellowface', 'R.F. Kuang', 2023, 'A novel about cultural appropriation and the publishing industry.', 'Mystery'],
  ['The Name of the Wind', 'Patrick Rothfuss', 2007, 'The first book in the Kingkiller Chronicle about a legendary musician and magician.', 'Fantasy'],
  ['The Wise Man\'s Fear', 'Patrick Rothfuss', 2011, 'The second book in the Kingkiller Chronicle.', 'Fantasy'],
  ['The Slow Regard of Silent Things', 'Patrick Rothfuss', 2014, 'A novella set in the Kingkiller Chronicle world.', 'Fantasy'],
  ['A Game of Thrones', 'George R.R. Martin', 1996, 'The first book in A Song of Ice and Fire series.', 'Fantasy'],
  ['A Clash of Kings', 'George R.R. Martin', 1998, 'The second book in A Song of Ice and Fire series.', 'Fantasy'],
  ['A Storm of Swords', 'George R.R. Martin', 2000, 'The third book in A Song of Ice and Fire series.', 'Fantasy'],
  ['A Feast for Crows', 'George R.R. Martin', 2005, 'The fourth book in A Song of Ice and Fire series.', 'Fantasy'],
  ['A Dance with Dragons', 'George R.R. Martin', 2011, 'The fifth book in A Song of Ice and Fire series.', 'Fantasy'],
  ['The Way of Kings', 'Brandon Sanderson', 2010, 'The first book in the Stormlight Archive series.', 'Fantasy'],
  ['Words of Radiance', 'Brandon Sanderson', 2014, 'The second book in the Stormlight Archive series.', 'Fantasy'],
  ['Oathbringer', 'Brandon Sanderson', 2017, 'The third book in the Stormlight Archive series.', 'Fantasy'],
  ['Rhythm of War', 'Brandon Sanderson', 2020, 'The fourth book in the Stormlight Archive series.', 'Fantasy'],
  ['Mistborn: The Final Empire', 'Brandon Sanderson', 2006, 'The first book in the Mistborn trilogy.', 'Fantasy'],
  ['The Well of Ascension', 'Brandon Sanderson', 2007, 'The second book in the Mistborn trilogy.', 'Fantasy'],
  ['The Hero of Ages', 'Brandon Sanderson', 2008, 'The final book in the Mistborn trilogy.', 'Fantasy'],
  ['The Alloy of Law', 'Brandon Sanderson', 2011, 'A sequel to the Mistborn trilogy set 300 years later.', 'Fantasy'],
  ['Shadows of Self', 'Brandon Sanderson', 2015, 'The second book in the Wax and Wayne series.', 'Fantasy'],
  ['The Bands of Mourning', 'Brandon Sanderson', 2016, 'The third book in the Wax and Wayne series.', 'Fantasy'],
  ['The Lost Metal', 'Brandon Sanderson', 2022, 'The final book in the Wax and Wayne series.', 'Fantasy'],
  ['The Eye of the World', 'Robert Jordan', 1990, 'The first book in The Wheel of Time series.', 'Fantasy'],
  ['The Great Hunt', 'Robert Jordan', 1990, 'The second book in The Wheel of Time series.', 'Fantasy'],
  ['The Dragon Reborn', 'Robert Jordan', 1991, 'The third book in The Wheel of Time series.', 'Fantasy'],
  ['The Shadow Rising', 'Robert Jordan', 1992, 'The fourth book in The Wheel of Time series.', 'Fantasy'],
  ['The Fires of Heaven', 'Robert Jordan', 1993, 'The fifth book in The Wheel of Time series.', 'Fantasy'],
  ['Lord of Chaos', 'Robert Jordan', 1994, 'The sixth book in The Wheel of Time series.', 'Fantasy'],
  ['A Crown of Swords', 'Robert Jordan', 1996, 'The seventh book in The Wheel of Time series.', 'Fantasy'],
  ['The Path of Daggers', 'Robert Jordan', 1998, 'The eighth book in The Wheel of Time series.', 'Fantasy'],
  ['Winter\'s Heart', 'Robert Jordan', 2000, 'The ninth book in The Wheel of Time series.', 'Fantasy'],
  ['Crossroads of Twilight', 'Robert Jordan', 2003, 'The tenth book in The Wheel of Time series.', 'Fantasy'],
  ['Knife of Dreams', 'Robert Jordan', 2005, 'The eleventh book in The Wheel of Time series.', 'Fantasy'],
  ['The Gathering Storm', 'Robert Jordan & Brandon Sanderson', 2009, 'The twelfth book in The Wheel of Time series.', 'Fantasy'],
  ['Towers of Midnight', 'Robert Jordan & Brandon Sanderson', 2010, 'The thirteenth book in The Wheel of Time series.', 'Fantasy'],
  ['A Memory of Light', 'Robert Jordan & Brandon Sanderson', 2013, 'The final book in The Wheel of Time series.', 'Fantasy'],
  ['The Color of Magic', 'Terry Pratchett', 1983, 'The first book in the Discworld series.', 'Fantasy'],
  ['The Light Fantastic', 'Terry Pratchett', 1986, 'The second book in the Discworld series.', 'Fantasy'],
  ['Equal Rites', 'Terry Pratchett', 1987, 'The third book in the Discworld series.', 'Fantasy'],
  ['Mort', 'Terry Pratchett', 1987, 'The fourth book in the Discworld series.', 'Fantasy'],
  ['Sourcery', 'Terry Pratchett', 1988, 'The fifth book in the Discworld series.', 'Fantasy'],
  ['Wyrd Sisters', 'Terry Pratchett', 1988, 'The sixth book in the Discworld series.', 'Fantasy'],
  ['Pyramids', 'Terry Pratchett', 1989, 'The seventh book in the Discworld series.', 'Fantasy'],
  ['Guards! Guards!', 'Terry Pratchett', 1989, 'The eighth book in the Discworld series.', 'Fantasy'],
  ['Eric', 'Terry Pratchett', 1990, 'The ninth book in the Discworld series.', 'Fantasy'],
  ['Moving Pictures', 'Terry Pratchett', 1990, 'The tenth book in the Discworld series.', 'Fantasy'],
  ['Reaper Man', 'Terry Pratchett', 1991, 'The eleventh book in the Discworld series.', 'Fantasy'],
  ['Witches Abroad', 'Terry Pratchett', 1991, 'The twelfth book in the Discworld series.', 'Fantasy'],
  ['Small Gods', 'Terry Pratchett', 1992, 'The thirteenth book in the Discworld series.', 'Fantasy'],
  ['Lords and Ladies', 'Terry Pratchett', 1992, 'The fourteenth book in the Discworld series.', 'Fantasy'],
  ['Men at Arms', 'Terry Pratchett', 1993, 'The fifteenth book in the Discworld series.', 'Fantasy'],
  ['Soul Music', 'Terry Pratchett', 1994, 'The sixteenth book in the Discworld series.', 'Fantasy'],
  ['Interesting Times', 'Terry Pratchett', 1994, 'The seventeenth book in the Discworld series.', 'Fantasy'],
  ['Maskerade', 'Terry Pratchett', 1995, 'The eighteenth book in the Discworld series.', 'Fantasy'],
  ['Feet of Clay', 'Terry Pratchett', 1996, 'The nineteenth book in the Discworld series.', 'Fantasy'],
  ['Hogfather', 'Terry Pratchett', 1996, 'The twentieth book in the Discworld series.', 'Fantasy'],
  ['Jingo', 'Terry Pratchett', 1997, 'The twenty-first book in the Discworld series.', 'Fantasy'],
  ['The Last Continent', 'Terry Pratchett', 1998, 'The twenty-second book in the Discworld series.', 'Fantasy'],
  ['Carpe Jugulum', 'Terry Pratchett', 1998, 'The twenty-third book in the Discworld series.', 'Fantasy'],
  ['The Fifth Elephant', 'Terry Pratchett', 1999, 'The twenty-fourth book in the Discworld series.', 'Fantasy'],
  ['The Truth', 'Terry Pratchett', 2000, 'The twenty-fifth book in the Discworld series.', 'Fantasy'],
  ['Thief of Time', 'Terry Pratchett', 2001, 'The twenty-sixth book in the Discworld series.', 'Fantasy'],
  ['The Last Hero', 'Terry Pratchett', 2001, 'The twenty-seventh book in the Discworld series.', 'Fantasy'],
  ['The Amazing Maurice and His Educated Rodents', 'Terry Pratchett', 2001, 'The twenty-eighth book in the Discworld series.', 'Fantasy'],
  ['Night Watch', 'Terry Pratchett', 2002, 'The twenty-ninth book in the Discworld series.', 'Fantasy'],
  ['The Wee Free Men', 'Terry Pratchett', 2003, 'The thirtieth book in the Discworld series.', 'Fantasy'],
  ['Monstrous Regiment', 'Terry Pratchett', 2003, 'The thirty-first book in the Discworld series.', 'Fantasy'],
  ['A Hat Full of Sky', 'Terry Pratchett', 2004, 'The thirty-second book in the Discworld series.', 'Fantasy'],
  ['Going Postal', 'Terry Pratchett', 2004, 'The thirty-third book in the Discworld series.', 'Fantasy'],
  ['Thud!', 'Terry Pratchett', 2005, 'The thirty-fourth book in the Discworld series.', 'Fantasy'],
  ['Wintersmith', 'Terry Pratchett', 2006, 'The thirty-fifth book in the Discworld series.', 'Fantasy'],
  ['Making Money', 'Terry Pratchett', 2007, 'The thirty-sixth book in the Discworld series.', 'Fantasy'],
  ['Unseen Academicals', 'Terry Pratchett', 2009, 'The thirty-seventh book in the Discworld series.', 'Fantasy'],
  ['I Shall Wear Midnight', 'Terry Pratchett', 2010, 'The thirty-eighth book in the Discworld series.', 'Fantasy'],
  ['Snuff', 'Terry Pratchett', 2011, 'The thirty-ninth book in the Discworld series.', 'Fantasy'],
  ['Raising Steam', 'Terry Pratchett', 2013, 'The fortieth book in the Discworld series.', 'Fantasy'],
  ['The Shepherd\'s Crown', 'Terry Pratchett', 2015, 'The final book in the Discworld series.', 'Fantasy'],
  ['Good Omens', 'Terry Pratchett & Neil Gaiman', 1990, 'A novel about an angel and a demon trying to prevent the apocalypse.', 'Fantasy'],
  ['American Gods', 'Neil Gaiman', 2001, 'A novel about a man who discovers that the old gods of mythology are real and living in America.', 'Fantasy'],
  ['Neverwhere', 'Neil Gaiman', 1996, 'A novel about a man who discovers a hidden world beneath London.', 'Fantasy'],
  ['Coraline', 'Neil Gaiman', 2002, 'A novel about a girl who discovers a parallel world through a secret door.', 'Fantasy'],
  ['The Graveyard Book', 'Neil Gaiman', 2008, 'A novel about a boy raised by ghosts in a graveyard.', 'Fantasy'],
  ['The Ocean at the End of the Lane', 'Neil Gaiman', 2013, 'A novel about a man who returns to his childhood home and remembers magical events.', 'Fantasy'],
  ['Norse Mythology', 'Neil Gaiman', 2017, 'A retelling of Norse myths.', 'Fantasy'],
  ['The Sandman', 'Neil Gaiman', 1989, 'A graphic novel series about Dream, one of the seven Endless.', 'Fantasy'],
  ['Stardust', 'Neil Gaiman', 1999, 'A novel about a young man who ventures into a magical realm to find a fallen star.', 'Fantasy'],
  ['Anansi Boys', 'Neil Gaiman', 2005, 'A novel about a man who discovers his father was the African trickster god Anansi.', 'Fantasy'],
  ['The Book of Dust: La Belle Sauvage', 'Philip Pullman', 2017, 'The first book in The Book of Dust trilogy.', 'Fantasy'],
  ['The Book of Dust: The Secret Commonwealth', 'Philip Pullman', 2019, 'The second book in The Book of Dust trilogy.', 'Fantasy'],
  ['His Dark Materials: The Golden Compass', 'Philip Pullman', 1995, 'The first book in the His Dark Materials trilogy.', 'Fantasy'],
  ['His Dark Materials: The Subtle Knife', 'Philip Pullman', 1997, 'The second book in the His Dark Materials trilogy.', 'Fantasy'],
  ['His Dark Materials: The Amber Spyglass', 'Philip Pullman', 2000, 'The final book in the His Dark Materials trilogy.', 'Fantasy'],
  ['The Handmaid\'s Tale', 'Margaret Atwood', 1985, 'A dystopian novel about a woman living in a totalitarian society where women are treated as property.', 'Dystopian'],
  ['Oryx and Crake', 'Margaret Atwood', 2003, 'A novel about a post-apocalyptic world and the events that led to it.', 'Dystopian'],
  ['The Year of the Flood', 'Margaret Atwood', 2009, 'A companion novel to Oryx and Crake.', 'Dystopian'],
  ['MaddAddam', 'Margaret Atwood', 2013, 'The final book in the MaddAddam trilogy.', 'Dystopian'],
  ['The Blind Assassin', 'Margaret Atwood', 2000, 'A novel about two sisters and the mysterious death of one of them.', 'Mystery'],
  ['Alias Grace', 'Margaret Atwood', 1996, 'A novel about a woman convicted of murder in 19th-century Canada.', 'Historical'],
  ['The Robber Bride', 'Margaret Atwood', 1993, 'A novel about three women whose lives are affected by a mysterious woman.', 'Classic'],
  ['Cat\'s Eye', 'Margaret Atwood', 1988, 'A novel about an artist who returns to her hometown and confronts her past.', 'Classic'],
  ['The Edible Woman', 'Margaret Atwood', 1969, 'A novel about a woman who develops an eating disorder.', 'Classic'],
  ['Surfacing', 'Margaret Atwood', 1972, 'A novel about a woman who returns to her childhood home to search for her missing father.', 'Classic'],
  ['Lady Oracle', 'Margaret Atwood', 1976, 'A novel about a woman who fakes her own death to escape her past.', 'Classic'],
  ['Life Before Man', 'Margaret Atwood', 1979, 'A novel about three people whose lives intersect in Toronto.', 'Classic'],
  ['Bodily Harm', 'Margaret Atwood', 1981, 'A novel about a journalist who travels to the Caribbean and gets caught up in political violence.', 'Classic'],
  ['The Penelopiad', 'Margaret Atwood', 2005, 'A retelling of The Odyssey from Penelope\'s perspective.', 'Classic'],
  ['Hag-Seed', 'Margaret Atwood', 2016, 'A retelling of The Tempest set in a prison.', 'Classic'],
  ['The Testaments', 'Margaret Atwood', 2019, 'A sequel to The Handmaid\'s Tale about the fall of Gilead.', 'Dystopian'],
  ['Old Babes in the Wood', 'Margaret Atwood', 2023, 'A collection of short stories.', 'Classic'],
];

function addMoreBooks() {
  const dbPath = path.join(process.cwd(), 'data', 'books.db');
  const db = new Database(dbPath);

  // Get existing genres to map names to IDs
  const genres = db.prepare('SELECT id, name FROM genres').all() as { id: number; name: string }[];
  const genreMap: Record<string, number> = {};
  genres.forEach(genre => {
    genreMap[genre.name] = genre.id;
  });

  // Check which books already exist
  const existingBooks = db.prepare('SELECT title, author FROM books').all() as { title: string; author: string }[];
  const existingBookSet = new Set(existingBooks.map(book => `${book.title}|${book.author}`));

  const insertBook = db.prepare(`
    INSERT INTO books (title, author, year, description) 
    VALUES (?, ?, ?, ?)
  `);
  
  const insertBookGenre = db.prepare(`
    INSERT INTO book_genres (book_id, genre_id) VALUES (?, ?)
  `);

  let addedCount = 0;
  let skippedCount = 0;

  for (const [title, author, year, description, genreName] of additionalBooks) {
    const bookKey = `${title}|${author}`;
    
    if (existingBookSet.has(bookKey)) {
      skippedCount++;
      continue;
    }

    try {
      const result = insertBook.run(title, author, year, description);
      const bookId = result.lastInsertRowid as number;
      
      // Add genre association if genre exists
      if (genreMap[genreName]) {
        insertBookGenre.run(bookId, genreMap[genreName]);
      }
      
      addedCount++;
    } catch (error) {
      console.error(`Error adding book "${title}":`, error);
    }
  }

  db.close();
  
  console.log(`Added ${addedCount} new books`);
  console.log(`Skipped ${skippedCount} existing books`);
  console.log(`Total books in database: ${existingBooks.length + addedCount}`);
}

addMoreBooks(); 