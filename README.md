## CookSpace 
CookSpace is an interactive web app for anyone interested in cooking, whether you're an experienced chef or a beginner. This platform allows you to explore existing recipes created by others, as well as create your own for other people to see.

## Features
* Key Features:
  * Public Access:
    * Browse recipes created by other users
    * Search for other recipes
    * View details about every recipe including its ingredients and steps
  * For Registered Users:
    * Create an account or login to have access to new features
    * Create, edit and delete your own recipes
    * Favorite other users recipes for quick access
    * Edit your profile details
## Installation
    $ git clone https://github.com/AndreFNM/recipes-app
    $ cd recipes-app
    $ npm install
    $ cd recipe_images_server
    $ npm install
    $ docker build -t <image-name> .
    $ docker run -d -p 5001:5001 --name <container-name> <image-name>


## How to use
To use this web app you can run the command ```npm run dev``` after going through the installation process. Then you can open the following link http://localhost:3000 in your browser of choice.

## Technologies
This project was built using the following technologies:
* React
* Typescript
* Next.Js
* Tailwind CSS
* Mysql
* Docker 
* Playwright
