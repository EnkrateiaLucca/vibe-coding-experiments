#### Vibe-coding is a great way to learn

Andrej Karpathy [coined the term](https://simonwillison.net/2025/Feb/6/andrej-karpathy/) vibe-coding just over a month ago, and it has stuck:

> There’s a new kind of coding I call “vibe coding”, where you fully give in to the vibes, embrace exponentials, and forget that the code even exists. [...] I ask for the dumbest things like “decrease the padding on the sidebar by half” because I’m too lazy to find it. I “Accept All” always, I don’t read the diffs anymore. When I get error messages I just copy paste them in with no comment, usually that fixes it.

Andrej suggests this is “not too bad for throwaway weekend projects”. It’s also a _fantastic_ way to explore the capabilities of these models—and really fun.

The best way to learn LLMs is to play with them. Throwing absurd ideas at them and vibe-coding until they almost sort-of work is a genuinely useful way to accelerate the rate at which you build intuition for what works and what doesn’t.

I’ve been vibe-coding since before Andrej gave it a name! My [simonw/tools](https://github.com/simonw/tools) GitHub repository has 77 HTML+JavaScript apps and 6 Python apps, and every single one of them was built by prompting LLMs. I have learned _so much_ from building this collection, and I add to it at a rate of several new prototypes per week.

You can try most of mine out directly on [tools.simonwillison.net](https://tools.simonwillison.net/)—a GitHub Pages published version of the repo. I wrote more detailed notes on some of these back in October in [Everything I built with Claude Artifacts this week](https://simonwillison.net/2024/Oct/21/claude-artifacts/).

If you want to see the transcript of the chat used for each one it’s almost always linked to in the commit history for that page—or visit the new [colophon page](https://tools.simonwillison.net/colophon) for an index that includes all of those links.

#### A detailed example using Claude Code

While I was writing this article I had the idea for that [tools.simonwillison.net/colophon](https://tools.simonwillison.net/colophon) page—I wanted something I could link to that showed the commit history of each of my tools in a more obvious way than GitHub.

I decided to use that as an opportunity to demonstrate my AI-assisted coding process.

For this one I used [Claude Code](https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview), because I wanted it to be able to run Python code directly against my existing tools repository on my laptop.

Running the `/cost` command at the end of my session showed me this:

```
> /cost 
  ⎿  Total cost: $0.61
     Total duration (API): 5m 31.2s
     Total duration (wall): 17m 18.7s
```

The initial project took me just over 17 minutes from start to finish, and cost me 61 cents in API calls to Anthropic.

I used the authoritarian process where I told the model exactly what I wanted to build. Here’s my sequence of prompts ([full transcript here](https://gist.github.com/simonw/323e1b00ee4f8453c7834a7560eeafc1)).

I started by asking for an initial script to gather the data needed for the new page:

> Almost all of the HTML files in this directory were created using Claude prompts, and the details of those prompts are linked in the commit messages. Build a Python script that checks the commit history for each HTML file in turn and extracts any URLs from those commit messages into a list. It should then output a JSON file with this structure: {“pages”: {“name-of-file.html”: [“url”], {“name-of-file-2.html”: [“url1”, “url2”], ...—as you can see, some files may have more than one URL in their commit history. The script should be called gather_links.py and it should save a JSON file called gathered_links.json

I really didn’t think very hard about this first prompt—it was more of a stream of consciousness that I typed into the bot as I thought about the initial problem.

I inspected the initial result and spotted some problems:

> It looks like it just got the start of the URLs, it should be getting the whole URLs which might be to different websites—so just get anything that starts https:// and ends with whitespace or the end of the commit message

Then I changed my mind—I wanted those full commit messages too:

> Update the script—I want to capture the full commit messages AND the URLs—the new format should be {“pages”: {“aria-live-regions.html”: {“commits”: [{“hash”: hash, “message”: message, “date”: iso formatted date], “urls”: [list of URLs like before]

Providing examples like this is a great shortcut to getting exactly what you want.

Note that at no point have I looked at the code it’s written in [gather_links.py](https://github.com/simonw/tools/blob/87e2577983f11fc9c7bf7b7a268cf2404a21e1c5/gather_links.py)! This is pure vibe-coding: I’m looking at what it’s doing, but I’ve left the implementation details entirely up to the LLM.

The JSON looked good to me, so I said:

> This is working great. Write me a new script called build_colophon.py which looks through that gathered JSON file and builds and saves an HTML page. The page should be mobile friendly and should list every page—with a link to that page—and for each one display the commit messages neatly (convert newlines to br and linkify URLs but no other formatting)—plus the commit message dates and links to the commits themselves which are in [https://github.com/simonw/tools](https://github.com/simonw/tools)

Claude knows how GitHub URLs works, so telling it to link to the commits and providing the repo name was enough for it guess `https://github.com/simonw/tools/commit/fd9daf885c924ba277806b3440457d52b0ad90a8` for those commit URLs.

I tend to find Claude has good default taste when it comes to web page design—I said “the page should be mobile friendly” and left it at that.

Claude churned away and built me a page that wasn’t right, so I said:

> it’s not working right. ocr.html had a bunch of commits but in colophon.html there is only one link and heading for the first commit and the rest are shown within that same block—there should be separate HTML chunks with links and formatted dates for each of the other commits. Also the neatly formatted date should include the HH:MM as well as the date

It fixed the bug all on its own, leaving just two changes I decided to make:

> it’s almost perfect, but each page should have the commits displayed in the opposite order—oldest first

And then:

> One last change—the pages are currently listed alphabetically, lets instead list them with the most recently modified at the top

And that was the entire project! Here’s [build_colophon.py](https://github.com/simonw/tools/blob/1e04f12a1cacea8856946162457d0d77e60ee549/build_colophon.py), and the page it generated came out [looking pretty good](https://static.simonwillison.net/static/2025/colophon.html):

![Image 1: Tools Colophon. This page documents the creation of the tools on tools.simonwillison.net, including links to the Claude conversations used to build them. social-media-cropper.html b4a2bc December 10, 2024 20:35 Social media cropper  https://gist.github.com/simonw/12b8f88932a71450071190e1289a17e9 a10954 February 28, 2025 16:02 Support 2:1 and 14:10 ratios  https://gist.github.com/simonw/e23917eddcbb368c9b6180d581f8f40a](https://static.simonwillison.net/static/2025/colophon.jpg)

There was one remaining task: I needed to deploy the new colophon as part of my site, but I didn’t want to check that new `colophon.html` page into the repository itself. I wanted a custom GitHub Pages build process.

I started a brand new Claude Code session (clearing the slate) to see if that was something Claude could figure out too:

> This repo is deployed using GitHub Pages. I want to modify the build slightly—before deploying to GitHub Pages it should run python gather_links.py which will generate a file called gathered_links.json—then it should run python build_colophon.py which will use that file to create colophon.html—I want both gathered_links.json and colophon.html to be published to GitHub pages but I do not want them checked into the repo itself

Unlike the first time, this time I watched what it was doing very closely—I don’t know how to customize GitHub Pages builds in this way and I wanted to both learn how to do it and stay cautious that it might hallucinate details and fail at the task.

It told me it wanted to create this file and asked for my permission:

name: Deploy to GitHub Pages

on:
  # Run on push to main branch
  push:
    branches: [ main ]
  # Allow manual trigger
  workflow_dispatch:

# Sets permissions of the GITHUB_TOKEN
permissions:
  contents: read
  pages: write
  id-token: write

# Allow only one concurrent deployment
concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Need full history for git log in gather_links.py

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install dependencies
        run: |
 python -m pip install --upgrade pip
 - name: Generate links and build colophon run: | python gather_links.py python build_colophon.py - name: Setup Pages uses: actions/configure-pages@v4 - name: Build with Jekyll uses: actions/jekyll-build-pages@v1 - name: Upload artifact uses: actions/upload-pages-artifact@v3 deploy: environment: name: github-pages url: ${{ steps.deployment.outputs.page_url }} runs-on: ubuntu-latest needs: build steps: - name: Deploy to GitHub Pages id: deployment uses: actions/deploy-pages@v4

I guess that’s right? I appreciated that comment about “Need full history for git log in gather_links.py”—that’s something I could easily have missed.

Then it said it wanted to add those files to `.gitignore`—sounds like a good idea.

It spat out this summary of its actions so far:

> I’ve created a GitHub Actions workflow for GitHub Pages that:
> 
> 
> 1.   Creates a .github/workflows/pages.yml file that: 
>     *   Runs on pushes to main branch
>     *   Checkouts the full git history (needed for gather_links.py)
>     *   Sets up Python 3.12
>     *   Runs both scripts in sequence to generate the files
>     *   Builds and deploys to GitHub Pages
> 
> 2.   Created .gitignore file to prevent the generated files from being committed
> 
> 
> Now when you push to main, GitHub Actions will:
> 
> 
> *   Run the gather_links.py script to create gathered_links.json
> *   Run build_colophon.py to create colophon.html
> *   Deploy both files (and all other files) to GitHub Pages

I checked to see how much it had cost:

```
> /cost 
  ⎿  Total cost: $0.1788
     Total duration (API): 44.6s
     Total duration (wall): 10m 18.6s
```

So 17 cents and 45 seconds using the Claude API. (I got distracted, hence the 10m of total time.) Here’s the [full transcript](https://gist.github.com/simonw/a560b07eef577e6183021d1ccaae7e07).

The code didn’t look like it would irreversibly break anything, so I pushed it to GitHub to see what would happen.

... and it worked! My new [colophon page](https://tools.simonwillison.net/colophon) was live.

There’s a catch. I watched the [GitHub Actions](https://github.com/simonw/tools/actions) interface while it was running and something didn’t look right:

![Image 2: GitHub Actions interface showing three completed actions. Test for Custom pages workflow for colophon,2 Deploy for that same name and another one called pages-build-deployment.](https://static.simonwillison.net/static/2025/github-actions-colophon.jpg)

I was expecting that “Test” job, but why were there two separate deploys?

I had a hunch that the previous, default Jekyll deploy was still running, while the new deploy ran at the same time—and it was pure luck of the timing that the new script finished later and over-wrote the result of the original.

It was time to ditch the LLMs and read some documentation!

I found this page on [Using custom workflows with GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) but it didn’t tell me what I needed to know.

On another hunch I checked the GitHub Pages settings interface for my repo and found this option:

![Image 3: GitHub Pages UI - shows your site is live at tools.simonwillison.net, deployed 7 minutes ago. - then under Buyld and deployment a source menu shows options for GitHub Actions or for Deploy from a branch (selected)](https://static.simonwillison.net/static/2025/github-pages-settings.jpg)

My repo was set to “Deploy from a branch”, so I switched that over to “GitHub Actions”.

I manually updated my `README.md` to add a link to the new Colophon page in [this commit](https://github.com/simonw/tools/commit/4ee15aaad8e9a412505210a30f485528cb3c0390), which triggered another build.

This time only two jobs ran, and the end result was the correctly deployed site:

![Image 4: Only two in-progress workflows now, one is the Test one and the other is the Deploy to GitHub Pages one.](https://static.simonwillison.net/static/2025/github-actions-colophon-2.jpg)

(I later spotted another bug—some of the links inadvertently included `<br>` tags in their `href=`, which I [fixed](https://github.com/simonw/tools/commit/87e2577983f11fc9c7bf7b7a268cf2404a21e1c5) with another [11 cent Claude Code session](https://gist.github.com/simonw/d5ccbca1b530868980609222790a97cb).)

**Update**: I improved the colophon further by [adding AI-generated descriptions of the tools](https://simonwillison.net/2025/Mar/13/tools-colophon/).

#### Be ready for the human to take over

I got lucky with this example because it helped illustrate my final point: expect to need to take over.

LLMs are no replacement for human intuition and experience. I’ve spent enough time with GitHub Actions that I know what kind of things to look for, and in this case it was faster for me to step in and finish the project rather than keep on trying to get there with prompts.

#### The biggest advantage is speed of development

My new [colophon page](https://tools.simonwillison.net/colophon) took me just under half an hour from conception to finished, deployed feature.

I’m certain it would have taken me significantly longer without LLM assistance—to the point that I probably wouldn’t have bothered to build it at all.

_This_ is why I care so much about the productivity boost I get from LLMs so much: it’s not about getting work done faster, it’s about being able to ship projects that I wouldn’t have been able to justify spending time on at all.

I wrote about this in March 2023: [AI-enhanced development makes me more ambitious with my projects](https://simonwillison.net/2023/Mar/27/ai-enhanced-development/). Two years later that effect shows no sign of wearing off.

It’s also a great way to accelerate learning new things—today that was how to customize my GitHub Pages builds using Actions, which is something I’ll certainly use again in the future.

The fact that LLMs let me execute my ideas faster means I can implement more of them, which means I can learn even more.

#### LLMs amplify existing expertise

Could anyone else have done this project in the same way? Probably not! My prompting here leaned on 25+ years of professional coding experience, including my previous explorations of GitHub Actions, GitHub Pages, GitHub itself and the LLM tools I put into play.

I also _knew_ that this was going to work. I’ve spent enough time working with these tools that I was confident that assembling a new HTML page with information pulled from my Git history was entirely within the capabilities of a good LLM.

My prompts reflected that—there was nothing particularly novel here, so I dictated the design, tested the results as it was working and occasionally nudged it to fix a bug.

If I was trying to build a Linux kernel driver—a field I know virtually nothing about—my process would be entirely different.

#### Bonus: answering questions about codebases

If the idea of using LLMs to write code for you still feels deeply unappealing, there’s another use-case for them which you may find more compelling.

Good LLMs are _great_ at answering questions about code.

This is also very low stakes: the worst that can happen is they might get something wrong, which may take you a tiny bit longer to figure out. It’s still likely to save you time compared to digging through thousands of lines of code entirely by yourself.

The trick here is to dump the code into a long context model and start asking questions. My current favorite for this is the catchily titled `gemini-2.0-pro-exp-02-05`, a preview of Google’s Gemini 2.0 Pro which is currently free to use via their API.

I used this trick just [the other day](https://simonwillison.net/2025/Mar/6/monolith/). I was trying out a new-to-me tool called [monolith](https://github.com/Y2Z/monolith), a CLI tool written in Rust which downloads a web page and all of its dependent assets (CSS, images etc) and bundles them together into a single archived file.

I was curious as to how it worked, so I cloned it into my temporary directory and ran these commands:

cd /tmp
git clone https://github.com/Y2Z/monolith
cd monolith

files-to-prompt . -c | llm -m gemini-2.0-pro-exp-02-05 \
  -s 'architectural overview as markdown'

I’m using my own [files-to-prompt](https://github.com/simonw/files-to-prompt) tool (built for me by Claude 3 Opus [last year](https://simonwillison.net/2024/Apr/8/files-to-prompt/)) here to gather the contents of all of the files in the repo into a single stream. Then I pipe that into my [LLM](https://llm.datasette.io/) tool and tell it (via the [llm-gemini](https://github.com/simonw/llm-gemini) plugin) to prompt Gemini 2.0 Pro with a system prompt of “architectural overview as markdown”.

This gave me back a [detailed document](https://gist.github.com/simonw/2c80749935ae3339d6f7175dc7cf325b) describing how the tool works—which source files do what and, crucially, which Rust crates it was using. I learned that it used `reqwest`, `html5ever`, `markup5ever_rcdom` and `cssparser` and that it doesn’t evaluate JavaScript at all, an important limitation.

I use this trick several times a week. It’s a great way to start diving into a new codebase—and often the alternative isn’t spending more time on this, it’s failing to satisfy my curiosity at all.

I included three more examples in [this recent post](https://simonwillison.net/2025/Feb/14/files-to-prompt/).