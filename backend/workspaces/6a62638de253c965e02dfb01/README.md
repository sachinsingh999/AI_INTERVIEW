# Implement Dynamic Product Listing Filters and Sorting
      
## Description
You've been provided with a basic React application that displays a list of products. The starter template includes a basic `App.js`, a `ProductList.js` component which iterates over a `products` array (provided as mock data in `data/products.js`), and a `ProductCard.js` component to render individual products. Your task is to enhance this product listing page by implementing dynamic filtering and sorting capabilities. You will need to integrate new UI controls, manage their state, and apply the filtering/sorting logic to the product data before rendering the `ProductCard` components within `ProductList.js`.

## Requirements
- Implement a filter section with controls for 'Category'. Allow users to select multiple categories (e.g., 'Electronics', 'Clothing', 'Books').
- Implement a filter section with controls for 'Price Range'. This could be two input fields (min/max) or a slider component.
- Implement a sort dropdown with options to sort products by 'Price' (Low to High, High to Low).
- Implement a sort dropdown with options to sort products by 'Name' (A-Z, Z-A).
- Ensure that filters and sort options can be combined effectively and correctly.
- Add a 'Clear Filters' button that resets all applied filters and sort selections.

## Acceptance Criteria
- The application successfully displays an initial list of products from the mock data.
- Selecting a single category filter correctly displays only products belonging to that category.
- Selecting multiple category filters correctly displays products belonging to any of the selected categories.
- Applying a price range filter correctly displays products whose prices fall within the specified range.
- Selecting a price sort option (Low to High or High to Low) correctly reorders the displayed products.
- Selecting a name sort option (A-Z or Z-A) correctly reorders the displayed products alphabetically.
- Combining any filter (e.g., category, price range) with any sort option (e.g., price, name) correctly displays the filtered and sorted subset of products.
- Clicking the 'Clear Filters' button resets all active filters and sort options, reverting the product list to its original, unfiltered, and unsorted state.
- The user interface for filter and sort controls is functional, intuitive, and provides clear visual feedback.

## Evaluation Rubric
Correctness & Functionality (45%): All requirements met, filters and sorts work accurately, edge cases handled (e.g., no products found for a given filter combination).
Code Quality & Maintainability (30%): Clean, readable, well-structured code, appropriate use of React patterns, component reusability, clear variable names, comments where necessary.
State Management (15%): Effective and efficient management of component state related to filters and sorting, avoiding unnecessary re-renders.
UI/UX (10%): User interface for filters and sort options is intuitive, easy to use, and provides good visual feedback.

---
*Difficulty: Medium • Estimated Time: 60 Mins*
