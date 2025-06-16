# Step 1: Use a base image to run Node.js
FROM node:20.10.0-alpine

# Step 2: Set the working directory
WORKDIR /app

# Step 3: Copy package.json and package-lock.json files
COPY package*.json ./

# Step 4: Install only production dependencies
RUN npm i --force

# Step 5: Copy the built app (including the `.next` directory)
COPY . .

# Step 6: Expose the port Next.js will run on
EXPOSE 3000

# Step 7: Start the Next.js app in production mode
CMD ["npm", "run", "start"]