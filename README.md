# Gradebook

A small, responsive student score tracker built with HTML, CSS, and vanilla JavaScript. It demonstrates how arrays make ordered collections of records straightforward to add to, search, update, and summarize. Student data is saved in the browser's `localStorage`.

## Real-world applications of arrays

- **Image processing:** Pixels are arranged in rows and columns. Arrays let software find and update pixel values by coordinate, which is useful for filters, resizing, and display.
- **Audio and signal processing:** Sound is represented as an ordered sequence of samples. Arrays support fast indexed access while playing, filtering, or transforming those samples.
- **Sensor and time-series readings:** Measurements such as hourly temperatures can be kept in chronological order and processed to calculate trends, minima, and averages.
- **Class gradebooks:** A roster is a collection of student records. Arrays make it easy to add students, search and sort the roster, and calculate class statistics.

Arrays are a natural fit when an application needs an ordered collection and frequent traversal or indexed access. They are not the only possible data structure, but replacing them with unrelated standalone variables would make collections harder to grow, process, and maintain. In JavaScript, arrays can grow dynamically as the roster changes.

## Chosen application: student gradebook

The app stores each student's name, subject, score, and identifier in a JavaScript array. Array operations are used to append new records, map updates, filter search results, and reduce scores into a class average. This keeps one source of truth for the roster and makes it possible to update the interface and summary values from the same data.

### Run it

Open `index.html` in a modern browser. Add, edit, search, and delete student records. The browser stores the roster locally, so data remains available on later visits from the same browser and device.
