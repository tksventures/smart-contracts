docker run -d -p 6860:6860 -p 6869:6869 wavesplatform/waves-private-node
echo "Launched private waves node on localhost"
docker run -d -e API_NODE_URL=http://localhost:6869 -e NODE_LIST=http://localhost:6869 -p 3000:8080 wavesplatform/explorer
echo "Launched local waves explorer on port 3000"