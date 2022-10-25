PLUGINS_DIR="./plugins"

echo "🚧 Installing plugins in dir - $PLUGINS_DIR"
echo


# for each directory in plugins dir that contains a package.json
# ie - eligable for plugin installation
for d in $PLUGINS_DIR/*/package.json ; do
    PLUGIN_DIR=$(dirname $d);
	PLUGIN_NAME=$(basename $PLUGIN_DIR);

	echo "🧩 Installing plugin - $PLUGIN_NAME"

	pnpm --dir $PLUGIN_DIR install

	echo
done