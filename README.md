# What-Can-We-Cook (ITIS-3300 Project)
![Homepage](img/homepage.png "Homepage")
Group information available in the [GROUP-INFO](./GROUP-INFO) file.

## Repository Structure
|-- `src/` - Source code for the project.  
|-- `documents/` - Documentation files and resources.  
|-- `reports/` - Reports and write-ups related to the project.  
|-- `summaries/` - Summaries of meetings, tasks, and progress.


### Installing necessary packages:  
`pip install -r requirements.txt`

### Run the server:

`python ./run.py`

### Test API by built-in docs:
[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### Development Notes
Please format your code before each commit by right-clicking the project folder and selecting `Reformat Code`.
Set your IDE to use Tabs (width of 4).

### Tests
To run the tests just run the following command\
```bash
  pytest src/api/tests/
```