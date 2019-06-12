ENDPOINT="_ENDPOINT_"
echo "_HEADER_MESSAGE_"
echo "\nCommiting..."
curl -X POST --data '{"jsonrpc":"2.0","id":1,"params":{"message":"_COMMIT_MESSAGE_"},"method":"commit-entry"}' -H 'content-type:text/plain;' $ENDPOINT
echo  "\nRevealing..."
curl -X POST --data '{"jsonrpc":"2.0","id":2,"params":{"entry":"_REVEAL_MESSAGE_"},"method":"reveal-entry"}' -H 'content-type:text/plain;' $ENDPOINT
echo "\nPlease wait for the next block to verify the effect"
