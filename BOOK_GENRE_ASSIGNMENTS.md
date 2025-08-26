# Book Genre Assignments

This document contains the comprehensive genre assignments for all books in the database. These assignments ensure that books are properly categorized and can be filtered and searched by genre.

## Genre Categories Available

The database includes the following 17 genres:
- **Adventure** - Stories involving exciting journeys, quests, and thrilling experiences
- **Children** - Books written for young readers
- **Classic** - Timeless literary works that have stood the test of time
- **Drama** - Dramatic works and plays
- **Dystopian** - Stories set in oppressive, futuristic societies
- **Fantasy** - Imaginative works with magical or supernatural elements
- **Fiction** - Imaginative works of prose not based on real events
- **Historical** - Stories set in specific historical periods
- **Horror** - Stories designed to frighten or unsettle readers
- **Mystery** - Stories involving puzzles, crimes, or unexplained events
- **Nonfiction** - Factual works based on real events and information
- **Philosophy** - Works exploring philosophical concepts and ideas
- **Poetry** - Literary works in verse form
- **Romance** - Stories focusing on romantic relationships
- **Satire** - Works using humor, irony, or ridicule to criticize
- **Science Fiction** - Stories involving futuristic science and technology
- **Tragedy** - Dramatic works depicting the downfall of characters

## Complete Book Genre Assignments

### John Steinbeck
- **East of Eden** - Classic, Historical, Fiction
- **Of Mice and Men** - Classic, Fiction, Tragedy
- **The Grapes of Wrath** - Classic, Historical, Fiction

### Ernest Hemingway
- **The Sun Also Rises** - Classic, Fiction, Historical
- **A Farewell to Arms** - Classic, Fiction, Historical
- **For Whom the Bell Tolls** - Classic, Fiction, Historical
- **The Old Man and the Sea** - Classic, Fiction, Adventure

### French Literature
- **The Little Prince** - Children, Fantasy, Philosophy
- **Being and Nothingness** - Philosophy, Nonfiction
- **Nausea** - Classic, Fiction, Philosophy

### Albert Camus
- **The Fall** - Classic, Fiction, Philosophy
- **The Myth of Sisyphus** - Philosophy, Nonfiction
- **The Stranger** - Classic, Fiction, Philosophy
- **The Plague** - Classic, Fiction, Philosophy

### Latin American Literature
- **The Tunnel** - Classic, Fiction
- **Hopscotch** - Classic, Fiction
- **The Death of Artemio Cruz** - Classic, Fiction, Historical
- **The Labyrinth of Solitude** - Philosophy, Nonfiction
- **Ficciones** - Fantasy, Fiction
- **The Aleph** - Fantasy, Fiction
- **Pedro Páramo** - Fantasy, Fiction
- **The House of the Spirits** - Fantasy, Fiction
- **Love in the Time of Cholera** - Romance, Fiction, Historical
- **One Hundred Years of Solitude** - Fantasy, Fiction

### Russian Literature
- **The Master and Margarita** - Fantasy, Fiction, Satire
- **A Hero of Our Time** - Classic, Fiction, Adventure

### Other Classics
- **On the Road** - Classic, Fiction, Adventure
- **Cyrano de Bergerac** - Classic, Drama, Romance
- **To Kill a Mockingbird** - Classic, Fiction, Historical
- **The Kite Runner** - Fiction, Historical

### Additional Books
- **The Sorrows of Young Werther** - Classic, Fiction, Romance
- **War and Peace** - Classic, Fiction, Historical
- **Anna Karenina** - Classic, Fiction, Romance
- **The Three Musketeers** - Classic, Fiction, Adventure
- **The Time Machine** - Classic, Fiction, Science Fiction
- **The Call of the Wild** - Classic, Fiction, Adventure
- **The Picture of Dorian Gray** - Classic, Fiction, Horror

## Implementation Notes

### Current Status
- **Total Books**: 86
- **Books with Genres**: 10 (as of latest update)
- **Books Pending Genres**: 76

### Genre Assignment Process
1. **API Endpoint**: Created temporary endpoint `/api/admin/assign-book-genres` to assign genres
2. **DynamoDB Updates**: Uses `bookOperations.setGenres()` to update book records
3. **Local Database**: Updated `src/lib/database.ts` to include genre assignments for future re-initialization

### Next Steps
1. **Complete Assignment**: Assign genres to remaining 76 books
2. **Verify Persistence**: Ensure genre assignments are properly saved in DynamoDB
3. **Update Local Scripts**: Ensure all genre assignments are reflected in local database creation scripts
4. **Testing**: Verify genre filtering and search functionality works correctly

### Technical Considerations
- **Genre IDs**: DynamoDB uses UUID strings for genre IDs
- **Book Updates**: Books are updated using `PutCommand` to ensure genre field persistence
- **Caching**: Genre assignments may be cached, requiring cache invalidation after updates
- **Performance**: Bulk genre assignment should be done during low-traffic periods

## Maintenance

### Adding New Books
When adding new books to the database:
1. Assign appropriate genres from the available genre list
2. Update this documentation
3. Ensure genre assignments are reflected in both DynamoDB and local scripts

### Adding New Genres
When adding new genres:
1. Add to the genres table with appropriate description
2. Update this documentation
3. Consider which existing books might belong to the new genre

### Re-initializing Database
When re-initializing the database:
1. Run genre setup scripts to create all 17 genres
2. Run book creation scripts that include genre assignments
3. Verify all books have proper genre assignments
