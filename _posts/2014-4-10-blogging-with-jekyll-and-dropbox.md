---
layout: post
title: Multiple Authors Blogging with Jekyll (Remotely)
description: The <a target="_blank" href="http://www.plattebasintimelapse.com/blog">PBT Team Blog</a> is built with Jekyll, a static site generator. It's powered by a Dropbox account and multiple authors, often from the road. Here's how I made that.

---        

When I started conceiving of a blog for our team, I kept hearing the frustrated voices of others in my head. It was usually a voice bemoaning the cumbersome Drupal install we have powering our main site. I researched alternatives and quickly found [Jekyll](http://www.jekyllrb.com).

Besides teaching the team to use Markdown and some basics of how the web works, Jekyll was a great solution for a quick and easy blog. Pretty soon I had a page set up and running courtesy of [Github pages](https://pages.github.com/). It was wonderful and fast and awesome!

Once the shiny paint dried off, I realized it was impossible for anyone else on the team to post to the blog, unless they wanted to sign up for a Github account, learn how to push to a repository, .... (Actually, now that I write it down, it doesn't seem that difficult. And probably something I should have considered encouraging them all to do!)

Nonetheless, I approached the multiple author, remote worker problem with a different solution in mind:

* Get a single Dropbox account
* Connect that account to our server
* Put the Jekyll website there
* Share ~~that folder~~ sub-folders with all necessary authors/contributors
* Rebuild the site whenever something changes

It sounded easy. So after a [few Google searches](https://www.google.com/search?q=how+to+build+a+jekyll+website+with+dropbox&oq=how+to+build+a+jekyll+website+with+dropbox&aqs=chrome..69i57.4287j0j7&sourceid=chrome&es_sm=91&ie=UTF-8) I set off with the necessary information to do just that. Here's what I did.

___

### First things first

I'm going to assume you already have a Jekyll website built. There are many great tutorials out there that do just this. 

I'll refer to the *Jekyll folder* several times. By this, I mean the Jekyll source files (the `index.html` and `_config.yml` and `_posts` and `_layouts`, etc.), not the generated `_site` folder.

Jekyll has a built in [development server](http://jekyllrb.com/docs/usage/) that you can flag with `--watch` to automatically regenerate the site locally. Use this to get a site fully built. You won't want to be making simple markup and style changes once it's deployed on Dropbox. It's painfully tedious to regenerate.

Before web deployment, make sure you have a `site.url` variable defined in the `_config.yml` file. Use absolute paths with `{% raw %}{{ site.url }}{% endraw %}` whenever using static assets (i.e. `.css` and `.js` files or images).

You are also going to need Jekyll installed on your server. Depending on your setup, you'll have different steps. I'm doing this on an OSX machine via Terminal. My server is CentOS Linux. I don't know much about any of these things so I'm only including what worked for me.

___

### Install Dropbox

`ssh` into your server. In my case, it's a Linux box run by a local company, [Binary.net](http://www.binary.net/). Following the instructions from Dropbox's [page](https://www.dropbox.com/install?os=lnx), run:

	cd ~ && wget -O - "https://www.dropbox.com/download?plat=lnx.x86_64" | tar xzf -
	
for a 64-bit installation. Next, run the Dropbox daemon from the newly created `.dropbox-dist` folder.

	~/.dropbox-dist/dropboxd
	
Copy the link into your browser and login with a your Dropbox account. Although Dropbox provides an exclude feature, I recommend using a fresh Dropbox account without any extra folders in it. You should see a happy Dropbox is connected prompt on your server.

Once the Dropbox client on your server is successfully linked, it will automatically create a Dropbox folder at `~/Dropbox` for the user you’re logged in as. Since the Dropbox service isn’t actually running on your server yet you won’t be able to see any files until the client is running and has a check to synchronize.

You can manually start the Dropbox client by with:

	~/.dropbox-dist/dropbox
	
But, a better option is to setup service management script.

Create a file and paste the following code into that file:

	sudo vi /etc/init.d/dropbox
	
	#!/bin/sh
	# dropbox service
	# Replace with linux users you want to run Dropbox clients for
	DROPBOX_USERS="user1 user2"
 
	DAEMON=.dropbox-dist/dropbox
 
	start() {
    	echo "Starting dropbox..."
    	for dbuser in $DROPBOX_USERS; do
       	 	HOMEDIR=`getent passwd $dbuser | cut -d: -f6`
        	if [ -x $HOMEDIR/$DAEMON ]; then
            	HOME="$HOMEDIR" start-stop-daemon -b -o -c $dbuser -S -u $dbuser -x $HOMEDIR/$DAEMON
        	fi
    	done
	}
 
	stop() {
    	echo "Stopping dropbox..."
    	for dbuser in $DROPBOX_USERS; do
        	HOMEDIR=`getent passwd $dbuser | cut -d: -f6`
        	if [ -x $HOMEDIR/$DAEMON ]; then
            	start-stop-daemon -o -c $dbuser -K -u $dbuser -x $HOMEDIR/$DAEMON
        	fi
    	done
	}
 
	status() {
    	for dbuser in $DROPBOX_USERS; do
        	dbpid=`pgrep -u $dbuser dropbox`
        	if [ -z $dbpid ] ; then
            	echo "dropboxd for USER $dbuser: not running."
        	else
            	echo "dropboxd for USER $dbuser: running (pid $dbpid)"
        	fi
    	done
	}
 
	case "$1" in
 
    	start)
        	start
        	;;
 
    	stop)
        	stop
        	;;
 
    	restart|reload|force-reload)
        	stop
        	start
        	;;
 
    	status)
        	status
        	;;
 
    	*)
        	echo "Usage: /etc/init.d/dropbox {start|stop|reload|force-reload|restart|status}"
        	exit 1
 
	esac
 
	exit 0

Make sure you replace the value of DROPBOX_USERS with a comma separated list of the linux users on your machine you want to run the Dropbox client for.

Make the script executable and add it to the default system startup.

	sudo chmod +x /etc/init.d/dropbox
	sudo update-rc.d dropbox defaults
	
Dropbox also has a separate python script that allows you to check on the status of the Dropbox client. I installed it with the rest of the `.dropbox` files.

	wget -O ~/.dropbox/dropbox.py "http://www.dropbox.com/download?dl=packages/dropbox.py"
	chmod 755 ~/.dropbox/dropbox.py
	
You can start Dropbox if you haven't already with:

	~/.dropbox/dropbox.py start
	
And check the status of it with:
	
	~/.dropbox/dropbox.py status
	
*This section was heavily lifted from [this blogpost](http://ubuntuservergui.com/ubuntu-server-guide/install-dropbox-ubuntu-server)*
___

### Configure Dropbox

With Dropbox installed on your server, you should now log into your account via the Dropbox website and copy your Jekyll folder into the root of Dropbox. I called it something like `team-blog`.

If you check the status of your Dropbox, 

	~/.dropbox/dropbox.py status
	
you will probably see that it is currently syncing all of your files. Yaay!

For security reasons and, in an attempt to not scare all of my team with source code, I created several sub-directories in the `_posts` directory, each titled something like `team-blog-posts-name` where the `name` is unique for each other. I also created a sub-directories under my `images` directory titled `team-blog-uploads`. This folder is empty as my parent `images` directory contains all additional assets needed to build the site.

It is these special folders I end up sharing with my team, `team-blog-posts-name` and `team-blog-uploads`. Each author gets their unique `post` folder and they all share the `upload`.

With this all set up, all authors can contribute to the blog and upload assets. Now we need to actually generate the site!

___

### Generate the Jekyll Site

To generate the site, you simply have to rebuild the source code each time a new blog post is added to one of the `post` directories. I used [incronbtab](http://linux.die.net/man/5/incrontab) to do this. Install incrontab and then add your user to the `incron.allow` file.

	sudo vi /etc/incron.allow
	
In order to edit the incrontab, I had to change my EDITOR variable to vi. I think it's because I don't have vim install on my server but I'm not sure.

	export EDITOR=vi
	
Then edit the job with

	incrontab -e
	
Because incrontab is not recursive, you have to list each post sub-directory specifically. The syntax for incrontab job looks like 

*\<path to watch> \<file system event conditions> \<command>*.

	/path/to/Dropbox/jekyll/_posts/named-post-folder IN_MODIFY,IN_DELETE,IN_CLOSE_WRITE,IN_MOVE jekyll build --source /path/to/Dropbox/jekyll --destination /var/www/html/sub-directory
	
I have a job for each authors post folder plus one for the assets upload folder, if an author wants to add a new picture to a completed post.

You can review your incrontab job with
	
	incrontab -l
	
___

### Final Steps

Share all of the necessary Dropbox directories with your team. You'll have to first add a file to a folder in order to generate the site originally. That is unless you already ran the `jekyll build` command. 

Visit your site at the sub-directory created. Any new changes you make *to a post* should happen in real-time. Just refresh the browser to see the changes!

___

### Bonus Stuff

#### Using Drafts

#### Styling in Mou

	
