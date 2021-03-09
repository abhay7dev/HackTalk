messages = count of messages
`{Number: message count}`

deleted = deleted qids
`{Number: qid; sep is "_"}`

{qid}\_\_message = message (question) data
`{String: author}{process.env.SPLITTER}{String: message}`

{qid}\_\_answer\_\_{aid} = answer data
`{String: author}{process.env.SPLITTER}{String: answer}`
