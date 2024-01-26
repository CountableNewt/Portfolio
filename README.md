# Portfolio
This website is honestly more than a portfolio, it's more my personal playground on the internet. The idea behind it is that I'm going to be able to display basically anything I want here. Right now I just have a design portfolio, but in the future this could also be where I host a blog, I might have other portfolios for music or 3D rendering. It's also a way for me to keep learning new things with web development and it can also serve as a playground in that sense. The TL;DR is that this is going to be a place where I just kind of chronicle me.  

## Tech Stack
Right now this is just an Express web server running on Node.js. It's being hosted on an AWS EC2 instance.

## PM2
Because I didn't want to put another web server in front of Node.js, I needed to find a way to keep Node.js projects alive once the terminal connection closed. I did some digging and found [PM2 on GitHub](https://github.com/Unitech/pm2). This allows me to run the Node.js project by daemonizing the app and keeping it alive indefinitely. I thought it was helpful so I'll just talk about it here. It has a bunch of other useful features that I'm not currently taking advantage of and you can check that out on their repo.