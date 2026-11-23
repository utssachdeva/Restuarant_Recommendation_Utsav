# Problem Statement

## AI-Powered Restaurant Recommendation System (Zomato Use Case)

Build a service inspired by Zomato that provides personalized restaurant recommendations using real-world data and an LLM.

---

## Objective

Design and implement an application that:

- Takes user preferences (such as location, budget, cuisine, and ratings)
- Uses a real-world dataset of restaurants
- Leverages an LLM to generate personalized, human-like recommendations
- Displays clear and useful results to the user

---

## System Workflow

### 1. Data Ingestion

- Load and preprocess the Zomato dataset from Hugging Face:  
  [ManikaSaini/zomato-restaurant-recommendation](https://huggingface.co/datasets/ManikaSaini/zomato-restaurant-recommendation)
- Extract relevant fields such as restaurant name, location, cuisine, cost, rating, etc.

### 2. User Input

Collect user preferences:

- **Location** (e.g., Bangalore)
- **Budget** (low, medium, high)
- **Cuisine** (e.g., Italian, Chinese)
- **Minimum rating**
- **Any additional preferences** (e.g., family-friendly, quick service)

### 3. Integration Layer

- Filter and prepare relevant restaurant data based on user input
- Pass structured results into an LLM prompt
- Design a prompt that helps the LLM reason and rank options

### 4. Recommendation Engine

Use the LLM to:

- Rank restaurants
- Provide explanations (why each recommendation fits)
- Optionally summarize choices

### 5. Output Display

Present top recommendations in a user-friendly format:

| Field | Description |
| --- | --- |
| Restaurant Name | Name of the recommended restaurant |
| Cuisine | Cuisine type(s) offered |
| Rating | Restaurant rating |
| Estimated Cost | Approximate cost for the user |
| AI-generated explanation | Why this recommendation matches the user's preferences |

---

## Project Context

| Attribute | Detail |
| --- | --- |
| Project name | Zomato |
| Domain | Food / Restaurant discovery |
| Core capability | Personalized recommendations via LLM |
| Data source | Hugging Face Zomato Bangalore dataset |
| Primary user inputs | Location, budget, cuisine, rating, free-text preferences |
| Expected output | Ranked list of restaurants with AI explanations |

---

## Success Criteria

- User preferences are collected clearly and used to filter the dataset
- Filtered restaurant candidates are passed to an LLM with a well-designed prompt
- The system returns ranked recommendations with human-readable justifications
- Results are presented in a clear, usable format for end users
