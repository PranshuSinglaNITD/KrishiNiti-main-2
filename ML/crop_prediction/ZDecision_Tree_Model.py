import pandas as pd
import numpy as np
import joblib # Fixed import

# 1. Load and clean data
print("Loading data...")
data = pd.read_csv('preprocessed2.csv')
data['Season'] = data['Season'].str.strip()

if 'Unnamed: 0' in data.columns:
    del data['Unnamed: 0']

training_data = list(np.array(data))
header = ['State_Name', 'District_Name', 'Season', 'Crop']

# 2. Helper Functions
def unique_vals(Data, col): 
    return set([row[col] for row in Data])

def class_counts(Data):
    counts = {}
    for row in Data:
        label = row[-1]
        if label not in counts: 
            counts[label] = 0
        counts[label] += 1
    return counts

class Question:
    def __init__(self, column, value):
        self.column = column
        self.value = value
    def match(self, example):
        val = example[self.column]
        return val == self.value
    def __repr__(self):
        return "Is %s %s %s?" % (header[self.column], "==", str(self.value))

def partition(Data, question):
    true_rows, false_rows = [], []
    for row in Data:
        if question.match(row): 
            true_rows.append(row)
        else: 
            false_rows.append(row)
    return true_rows, false_rows

def gini(Data):
    counts = class_counts(Data)
    impurity = 1
    for lbl in counts:
        prob_of_lbl = counts[lbl] / float(len(Data))
        impurity -= prob_of_lbl**2
    return impurity

def info_gain(left, right, current_uncertainty):
    p = float(len(left)) / (len(left) + len(right))
    return current_uncertainty - p * gini(left) - (1 - p) * gini(right)

def find_best_split(Data):
    best_gain = 0
    best_question = None
    current_uncertainty = gini(Data)
    n_features = len(Data[0]) - 1
    for col in range(n_features):
        values = unique_vals(Data, col)
        for val in values:
            question = Question(col, val)
            true_rows, false_rows = partition(Data, question)
            if len(true_rows) == 0 or len(false_rows) == 0: 
                continue
            gain = info_gain(true_rows, false_rows, current_uncertainty)
            if gain > best_gain:
                best_gain, best_question = gain, question
    return best_gain, best_question

class Leaf:
    def __init__(self, Data):
        self.predictions = class_counts(Data)

class Decision_Node:
    def __init__(self, question, true_branch, false_branch):
        self.question = question
        self.true_branch = true_branch
        self.false_branch = false_branch

# Added max_depth to prevent infinite loops / crashes
def build_tree(Data, depth=0, max_depth=10):
    if depth >= max_depth:
        return Leaf(Data)
        
    gain, question = find_best_split(Data)
    
    if gain == 0: 
        return Leaf(Data)
        
    true_rows, false_rows = partition(Data, question)
    true_branch = build_tree(true_rows, depth + 1, max_depth)
    false_branch = build_tree(false_rows, depth + 1, max_depth)
    return Decision_Node(question, true_branch, false_branch)

# 3. Train and Save
print("Building tree... this may take a few minutes depending on dataset size.")
my_tree = build_tree(training_data)

print("Saving model to filetest2.pkl...")
joblib.dump(my_tree, 'filetest2.pkl')
print("Done! Model saved.")